import * as moment from 'moment';
import { JwtPayload } from 'src/auth/dto/jwt-payload.dto';
import { v4 as uuidv4 } from 'uuid';

const generateJwtPayload = (id: string, email: string): JwtPayload => {
  const refreshExp = moment().add(3, 'minute').unix();
  const refreshUniqueId = uuidv4();

  return {
    id,
    email,
    refreshExp,
    refreshId: refreshUniqueId,
  };
};

export default generateJwtPayload;
