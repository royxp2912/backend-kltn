import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliveryAddress } from 'src/schemas/DeliveryAddress.schema';
import { UsersService } from 'src/users/users.service';
import { resourceLimits } from 'worker_threads';
import { CreateDlvAddDto, UpdateDlvAddDto } from './dto';

@Injectable()
export class DeliveryAddressService {
    constructor(
        @InjectModel(DeliveryAddress.name) private readonly deliveryAddressModel: Model<DeliveryAddress>,
        private readonly userService: UsersService,
    ) { }

    // CREATE ========================================
    async create(createDlvAddDto: CreateDlvAddDto): Promise<void> {
        // check user exist
        await this.userService.getById(createDlvAddDto.user);

        const newDeliveryAddress = new this.deliveryAddressModel(createDlvAddDto);
        const result = await newDeliveryAddress.save();

        const listAdd = await this.deliveryAddressModel.find({ user: createDlvAddDto.user });
        if (listAdd.length === 1) await this.setDefault(result._id);
    }

    // UPDATE ========================================
    async setDefault(dlvAddId: Types.ObjectId): Promise<void> {
        const result = await this.getById(dlvAddId);
        if (result.isDefault) throw new ConflictException("Delivery Address is already the default.");

        await this.deliveryAddressModel.findOneAndUpdate(
            {
                user: result.user,
                isDefault: true
            },
            { $set: { isDefault: false } }
        )

        result.isDefault = true;
        await result.save();
    }

    async update(updateDlvAddDto: UpdateDlvAddDto): Promise<void> {
        const { address, ...others } = updateDlvAddDto;
        const result = await this.deliveryAddressModel.findByIdAndUpdate(
            address,
            { $set: others }
        )

        if (!result) throw new NotFoundException("Delivery Address Not Found");
    }

    // READ ========================================
    async getById(dlvAddId: Types.ObjectId) {
        const result = await this.deliveryAddressModel.findById(dlvAddId)
            .select("-__v -createdAt -updatedAt")
        if (!result) throw new NotFoundException("Delivery Address Not Found");
        return result;
    }

    async getDefaultlByUserId(userId: Types.ObjectId): Promise<DeliveryAddress> {
        // check user exist
        await this.userService.getById(userId);

        const result = await this.deliveryAddressModel.findOne({ user: userId, isDefault: true })
            .select("-__v -createdAt -updatedAt");
        if (!result) throw new NotFoundException("User does not have a delivery address yet.");
        return result;
    }

    async getByUserId(userId: Types.ObjectId): Promise<DeliveryAddress[]> {
        // check user exist
        await this.userService.getById(userId);

        const result = await this.deliveryAddressModel.find({ user: userId })
            .select("-__v -createdAt -updatedAt");
        return result;
    }

    // DELETE ========================================
    async deleteByID(dlvAddId: Types.ObjectId): Promise<void> {
        const result = await this.deliveryAddressModel.findByIdAndDelete(dlvAddId);
        if (!result) throw new NotFoundException("Delivery Address Not Found");
    }

    async deleteByUserID(userId: Types.ObjectId): Promise<void> {
        // check user exist
        await this.userService.getById(userId);

        await this.deliveryAddressModel.deleteMany({ user: userId });
    }

    async deleteAll(): Promise<void> {
        await this.deliveryAddressModel.deleteMany({});
    }
}
