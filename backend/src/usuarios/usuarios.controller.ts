import {
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuariosService } from './usuarios.service';

type RequestConUsuario = Request & {
  user: {
    sub: number;
    correo: string;
  };
};

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('perfil')
  obtenerPerfil(@Req() req: RequestConUsuario) {
    return this.usuariosService.obtenerPerfil(req.user.sub);
  }

  @Patch('visitas')
  sumarVisita(@Req() req: RequestConUsuario) {
    return this.usuariosService.sumarVisita(req.user.sub);
  }
}
