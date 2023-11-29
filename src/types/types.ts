export type TLogin = {
  id: any;
  firstName: string;
  lastName: string;
  userBackground: string;
  email: string;
  token: string;
};

export type TToken = {
  token: string;
};

export type TMessage = {
  message: string;
};

export type PaginationResponse<T> = {
  itemsPerPage: T[];
  total: number;
};
