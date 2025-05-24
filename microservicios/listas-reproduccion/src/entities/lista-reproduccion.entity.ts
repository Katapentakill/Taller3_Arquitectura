import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ListaVideo } from './lista-video.entity';

@Entity()
export class ListaReproduccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  usuarioId: string;

  @Column({ default: false })
  softDelete: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @OneToMany(() => ListaVideo, (lv) => lv.lista, { cascade: true })
  videos: ListaVideo[];
}