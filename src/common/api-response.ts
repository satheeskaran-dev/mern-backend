export class ApiResponseDto {
  status: boolean;
  code: number;
  message: string;
  data?: any;

  constructor(status: boolean, code: number, message: string, data?: any) {
    this.status = status;
    this.code = code;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }
}
