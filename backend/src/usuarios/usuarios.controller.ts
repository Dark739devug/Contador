import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
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

  @Get()
  listarPerfiles() {
    return this.usuariosService.listarPerfiles();
  }

  // Se conserva para mantener compatibilidad con clientes anteriores.
  @Patch('visitas')
  sumarVisita(@Req() req: RequestConUsuario) {
    return this.usuariosService.sumarVisita(req.user.sub);
  }

  @Patch(':id/visitas')
  visitarPerfil(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.sumarVisita(id);
  }
}
