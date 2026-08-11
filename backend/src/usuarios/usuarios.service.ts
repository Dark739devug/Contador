import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async registrar(dto: CrearUsuarioDto): Promise<Usuario> {
    const existente = await this.usuariosRepository.findOne({
      where: { correo: dto.correo },
    });

    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const usuario = this.usuariosRepository.create({
      nombre: dto.nombre.trim(),
      correo: dto.correo.trim().toLowerCase(),
      visitas: 0,
    });

    return this.usuariosRepository.save(usuario);
  }

  async sumarVisita(id: number): Promise<Usuario> {
    const resultado = await this.usuariosRepository
      .createQueryBuilder()
      .update(Usuario)
      .set({ visitas: () => '"visitas" + 1' })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    const usuario = resultado.raw?.[0];

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      visitas: usuario.visitas,
      fechaRegistro: usuario.fecha_registro,
    };
  }
}
