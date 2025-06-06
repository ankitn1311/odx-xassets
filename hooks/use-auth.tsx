import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { usePathname } from 'next/navigation';

const useAuthToken = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get('auth_token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        // console.log("DECODED", decoded);
        const isExpired = (decoded?.exp ?? 0) * 1000 < Date.now();
        // console.log("ISEXPIREd", isExpired);

        if (isExpired) {
          // Cookies.remove("auth_token");
          setIsAuthenticated(false);
          // console.log("NOT AUTHENTICATED");
        } else {
          // console.log("AUTHENTICATED");
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('AERROR', error);
        // Cookies.remove("auth_token");
        setIsAuthenticated(false);
      }
    } else {
      // console.log("NOT AUTHENDTICATED+++");
      setIsAuthenticated(false);
    }
  }, [pathname]);

  return isAuthenticated;
};

export default useAuthToken;
