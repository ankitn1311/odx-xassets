export type MutationConfig<T> = {
  mutationOptions?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  };
};
