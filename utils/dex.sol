// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
contract OdxDex {
    using SafeERC20 for IERC20;
    // Struct to represent a liquidity pool
    struct Pool {
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalLiquidity;
    }
    // Mapping from token pair hash to pool data
    mapping(bytes32 => Pool) public pools;
    // Mapping from pool hash to liquidity provider balances
    mapping(bytes32 => mapping(address => uint256)) public liquidityBalance;
    // Fee in basis points (0.3%)
    uint256 public constant FEE_BASIS_POINTS = 30;
    uint256 public constant BASIS_POINTS_DIVISOR = 10000;
    // Events
    event LiquidityAdded(
        address indexed provider,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    event LiquidityRemoved(
        address indexed provider,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    // Helper function to sort tokens and generate pool hash
    function _getPoolHash(
        address tokenA,
        address tokenB
    ) internal pure returns (bytes32, address, address) {
        address token0 = tokenA < tokenB ? tokenA : tokenB;
        address token1 = tokenA < tokenB ? tokenB : tokenA;
        bytes32 poolHash = keccak256(abi.encodePacked(token0, token1));
        return (poolHash, token0, token1);
    }
    // Add liquidity to a pool
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) external returns (uint256 amount0, uint256 amount1, uint256 liquidity) {
        (bytes32 poolHash, address token0, address token1) = _getPoolHash(
            tokenA,
            tokenB
        );
        Pool storage pool = pools[poolHash];
        // Calculate amounts to deposit
        if (pool.reserve0 == 0 && pool.reserve1 == 0) {
            // First deposit
            amount0 = amountADesired;
            amount1 = amountBDesired;
            liquidity = Math.sqrt(amount0 * amount1);
        } else {
            // Not first deposit - maintain price ratio
            uint256 amount1Optimal = (amountADesired * pool.reserve1) /
                pool.reserve0;
            if (amount1Optimal <= amountBDesired) {
                require(amount1Optimal >= amountBMin, "Insufficient B amount");
                amount0 = amountADesired;
                amount1 = amount1Optimal;
            } else {
                uint256 amount0Optimal = (amountBDesired * pool.reserve0) /
                    pool.reserve1;
                require(amount0Optimal >= amountAMin, "Insufficient A amount");
                amount0 = amount0Optimal;
                amount1 = amountBDesired;
            }
            liquidity = Math.min(
                (amount0 * pool.totalLiquidity) / pool.reserve0,
                (amount1 * pool.totalLiquidity) / pool.reserve1
            );
        }
        require(liquidity > 0, "Insufficient liquidity minted");
        // Transfer tokens to the contract
        if (tokenA == token0) {
            IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
            IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);
        } else {
            IERC20(token0).safeTransferFrom(msg.sender, address(this), amount1);
            IERC20(token1).safeTransferFrom(msg.sender, address(this), amount0);
            // Swap variables for proper event emission
            (amount0, amount1) = (amount1, amount0);
        }
        // Update pool state
        pool.reserve0 += amount0;
        pool.reserve1 += amount1;
        pool.totalLiquidity += liquidity;
        liquidityBalance[poolHash][msg.sender] += liquidity;
        emit LiquidityAdded(
            msg.sender,
            token0,
            token1,
            amount0,
            amount1,
            liquidity
        );
        return (amount0, amount1, liquidity);
    }
    // Remove liquidity from a pool
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin
    ) external returns (uint256 amount0, uint256 amount1) {
        (bytes32 poolHash, address token0, address token1) = _getPoolHash(
            tokenA,
            tokenB
        );
        Pool storage pool = pools[poolHash];
        require(
            liquidityBalance[poolHash][msg.sender] >= liquidity,
            "Insufficient liquidity"
        );
        // Calculate amounts to withdraw
        amount0 = (liquidity * pool.reserve0) / pool.totalLiquidity;
        amount1 = (liquidity * pool.reserve1) / pool.totalLiquidity;
        require(amount0 >= amountAMin, "Insufficient amount0");
        require(amount1 >= amountBMin, "Insufficient amount1");
        // Update liquidity balances
        liquidityBalance[poolHash][msg.sender] -= liquidity;
        pool.totalLiquidity -= liquidity;
        // Update reserves
        pool.reserve0 -= amount0;
        pool.reserve1 -= amount1;
        // Transfer tokens back to user
        if (tokenA == token0) {
            IERC20(token0).safeTransfer(msg.sender, amount0);
            IERC20(token1).safeTransfer(msg.sender, amount1);
        } else {
            IERC20(token0).safeTransfer(msg.sender, amount1);
            IERC20(token1).safeTransfer(msg.sender, amount0);
            // Swap variables for proper event emission
            (amount0, amount1) = (amount1, amount0);
        }
        emit LiquidityRemoved(
            msg.sender,
            token0,
            token1,
            amount0,
            amount1,
            liquidity
        );
        return (amount0, amount1);
    }
    // Get quote for swap (view function, no state changes)
    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view returns (uint256 amountOut) {
        (bytes32 poolHash, address token0, address token1) = _getPoolHash(
            tokenIn,
            tokenOut
        );
        Pool storage pool = pools[poolHash];
        require(pool.reserve0 > 0 && pool.reserve1 > 0, "Pool does not exist");
        uint256 reserveIn;
        uint256 reserveOut;
        if (tokenIn == token0) {
            reserveIn = pool.reserve0;
            reserveOut = pool.reserve1;
        } else {
            reserveIn = pool.reserve1;
            reserveOut = pool.reserve0;
        }
        // Apply fee (0.3%)
        uint256 amountInWithFee = amountIn *
            (BASIS_POINTS_DIVISOR - FEE_BASIS_POINTS);
        // Calculate output based on constant product formula xy=k
        amountOut =
            (amountInWithFee * reserveOut) /
            (reserveIn * BASIS_POINTS_DIVISOR + amountInWithFee);
        return amountOut;
    }
    // Swap tokens
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external returns (uint256 amountOut) {
        require(tokenIn != tokenOut, "Identical tokens");
        require(amountIn > 0, "Insufficient input amount");
        (bytes32 poolHash, address token0, address token1) = _getPoolHash(
            tokenIn,
            tokenOut
        );
        Pool storage pool = pools[poolHash];
        require(pool.reserve0 > 0 && pool.reserve1 > 0, "Pool does not exist");
        // Get output amount
        amountOut = getQuote(tokenIn, tokenOut, amountIn);
        require(amountOut >= amountOutMin, "Insufficient output amount");
        // Transfer tokenIn from user to contract
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        // Transfer tokenOut from contract to user
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        // Update reserves
        if (tokenIn == token0) {
            pool.reserve0 += amountIn;
            pool.reserve1 -= amountOut;
        } else {
            pool.reserve0 -= amountOut;
            pool.reserve1 += amountIn;
        }
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        return amountOut;
    }
    // Get pool information
    function getPoolInfo(
        address tokenA,
        address tokenB
    )
        external
        view
        returns (uint256 reserve0, uint256 reserve1, uint256 totalLiquidity)
    {
        (bytes32 poolHash, , ) = _getPoolHash(tokenA, tokenB);
        Pool storage pool = pools[poolHash];
        return (pool.reserve0, pool.reserve1, pool.totalLiquidity);
    }
    // Get user's liquidity in a pool
    function getUserLiquidity(
        address user,
        address tokenA,
        address tokenB
    ) external view returns (uint256) {
        (bytes32 poolHash, , ) = _getPoolHash(tokenA, tokenB);
        return liquidityBalance[poolHash][user];
    }
}