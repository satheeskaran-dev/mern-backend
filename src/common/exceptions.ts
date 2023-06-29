export class CustomException {
  status: boolean;
  code: number;
  message: string;
  constructor(code: number, msg: string) {
    this.status = false;
    this.code = code;
    this.message = msg;
  }
}

export class CustomNotFoundException {
  status: boolean;
  code: number;
  message: string;
  constructor(msg: string) {
    this.status = false;
    this.code = 404;
    this.message = msg;
  }
}

export class CustomInternalServerErrorException {
  status: boolean;
  code: number;
  message: string;
  constructor() {
    this.status = false;
    this.code = 500;
    this.message = 'Internal server error !';
  }
}

export class CustomBadRequestException {
  status: boolean;
  code: number;
  message: string;
  constructor(msg: string) {
    this.status = false;
    this.code = 400;
    this.message = msg;
  }
}
