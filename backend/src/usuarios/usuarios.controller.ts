import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  registrar(@Body() dto: CrearUsuarioDto) {
    return this.usuariosService.registrar(dto);
  }

  @Patch(':id/visitas')
  sumarVisita(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.sumarVisita(id);
  }
}
