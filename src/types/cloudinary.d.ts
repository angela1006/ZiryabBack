declare module 'cloudinary' {
  export const v2: {
    config: (options: {
      cloud_name: string;
      api_key: string;
      api_secret: string;
    }) => void;
    uploader: {
      upload: (
        file: string,
        options: {
          folder: string;
          resource_type: string;
          format?: string;
          use_filename?: boolean;
          unique_filename?: boolean;
          access_mode?: string;
        },
      ) => Promise<{
        secure_url?: string;
        public_id?: string;
        version?: number;
        resource_type?: string;
        format?: string;
      }>;
    };
  };
}
