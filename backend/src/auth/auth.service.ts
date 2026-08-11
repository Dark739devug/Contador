import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async registro(dto: RegistroDto) {
    const correo = dto.correo.trim().toLowerCase();
    const existente = await this.usuariosService.buscarPorCorreo(correo);

    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const usuario = await this.usuariosService.crear({
      nombre: dto.nombre.trim(),
      correo,
      password: passwordHash,
      visitas: 0,
    });

    return this.crearRespuestaAutenticacion(usuario);
  }

  async login(dto: LoginDto) {
    const correo = dto.correo.trim().toLowerCase();
    const usuario = await this.usuariosService.buscarPorCorreo(correo);

    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const passwordCorrecto = await bcrypt.compare(
      dto.password,
      usuario.password,
    );

    if (!passwordCorrecto) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    return this.crearRespuestaAutenticacion(usuario);
  }

  private async crearRespuestaAutenticacion(usuario: {
    id: number;
    nombre: string;
    correo: string;
    visitas: number;
  }) {
    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      correo: usuario.correo,
    });

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        visitas: usuario.visitas,
      },
    };
  }
}
