import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from '../entity/factura.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FacturaService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepo: Repository<Factura>,
  ) {}

  crear(data: Partial<Factura>) {
    const factura = this.facturaRepo.create(data);
    return this.facturaRepo.save(factura);
  }

  obtenerTodas() {
    return this.facturaRepo.find();
  }

  obtenerPorId(id: string) {
    return this.facturaRepo.findOneBy({ id });
  }

  actualizar(id: string, data: Partial<Factura>) {
    return this.facturaRepo.update(id, data);
  }

  eliminar(id: string) {
    return this.facturaRepo.delete(id);
  }
}