import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  buscarPorCorreo(correo: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: { correo: correo.trim().toLowerCase() },
    });
  }

  buscarPorId(id: number): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({ where: { id } });
  }

  crear(datos: Partial<Usuario>): Promise<Usuario> {
    const usuario = this.usuariosRepository.create(datos);
    return this.usuariosRepository.save(usuario);
  }

  async obtenerPerfil(id: number) {
    const usuario = await this.buscarPorId(id);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      visitas: usuario.visitas,
      fechaRegistro: usuario.fechaRegistro,
    };
  }

  async listarPerfiles() {
    const usuarios = await this.usuariosRepository.find({
      select: {
        id: true,
        nombre: true,
        visitas: true,
        fechaRegistro: true,
      },
      order: { fechaRegistro: 'DESC' },
    });

    return usuarios;
  }

  async sumarVisita(id: number) {
    const resultado = await this.usuariosRepository
      .createQueryBuilder()
      .update(Usuario)
      .set({ visitas: () => '"visitas" + 1' })
      .where('id = :id', { id })
      .returning(['id', 'nombre', 'correo', 'visitas', 'fecha_registro'])
      .execute();

    const usuario = resultado.raw?.[0];

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      visitas: usuario.visitas,
      fechaRegistro: usuario.fecha_registro,
    };
  }
}
