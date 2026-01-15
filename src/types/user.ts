export type UserLogInFormData = {
  username: string;
  password: string;
};

export type UserLogInResponse = {
  expired: number;
  message: string;
  success: boolean;
  token: string;
  uid: string;
};

export type MessageResponse = {
  success: boolean
  message: string
}

export type ApiErrorResponse = {
  success: false
  message: string
  error: {
    code: string
    message: string
  }
}