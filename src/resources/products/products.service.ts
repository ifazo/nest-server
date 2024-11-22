import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: Prisma.ProductCreateInput) {
    return this.databaseService.product.create({
      data: createProductDto,
    });
  }

  async findAll(categoryId?: string) {
    if (categoryId)
      return this.databaseService.product.findMany({
        where: {
          categoryId,
        },
      });
    return this.databaseService.product.findMany();
  }

  async findOne(id: string) {
    return this.databaseService.product.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateProductDto: Prisma.ProductUpdateInput) {
    return this.databaseService.product.update({
      where: {
        id,
      },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    return this.databaseService.product.delete({
      where: {
        id,
      },
    });
  }
}
