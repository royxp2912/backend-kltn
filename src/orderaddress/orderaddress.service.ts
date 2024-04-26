import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderDelivery } from 'src/schemas/OrderAddress';
import { CreateAddressDto } from './dto';

@Injectable()
export class OrderAddressService {
    constructor(@InjectModel(OrderDelivery.name) private readonly orderDeliveryModel: Model<OrderDelivery>) { }

    // CREATE ========================================
    async create(createAddressDto: CreateAddressDto) {
        const newAdd = new this.orderDeliveryModel(createAddressDto);
        return await newAdd.save();
    }

    // READ ==========================================
    async getById(addId: Types.ObjectId) {
        return await this.orderDeliveryModel.findById(addId).select("-__v -createdAt -updatedAt -order");
    }

    // UPDATE ========================================
    // DELETE ========================================
    async deletetById(addId: Types.ObjectId) {
        return await this.orderDeliveryModel.findByIdAndDelete(addId);
    }

    async deletetAll() {
        return await this.orderDeliveryModel.deleteMany({});
    }

}
