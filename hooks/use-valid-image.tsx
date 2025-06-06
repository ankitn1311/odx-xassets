import { useState, useEffect } from 'react';

const useIsValidImage = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();

    // Handle successful load
    img.onload = () => {
      setIsLoaded(true);
      setHasError(false);
    };

    // Handle load failure
    img.onerror = () => {
      setIsLoaded(false);
      setHasError(true);
    };

    // Set image source
    img.src = src;

    // Cleanup the image object when the component unmounts
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { isLoaded, hasError, showDefaultImage: !isLoaded || hasError };
};

export default useIsValidImage;
