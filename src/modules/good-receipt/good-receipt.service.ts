import { Model, Types } from 'mongoose';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Supplier } from 'src/schemas/supplier.schema';
import { GoodReceipt } from 'src/schemas/goodReceipt.schema';
import { DetailGoodReceipt } from 'src/schemas/detailGoodReceipt.schema';
import {
    CreateSupplierDto, UpdateSupplierDto
} from './dto';
import { CreateGoodReceiptDto } from './dto/CreateGoodReceipt.dto';
import { User } from 'src/schemas/user.schema';
import { USER_ROLES } from 'src/constants/schema.enum';

@Injectable()
export class GoodReceiptService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
        @InjectModel(GoodReceipt.name) private readonly goodReceiptModel: Model<GoodReceipt>,
        @InjectModel(DetailGoodReceipt.name) private readonly detailGoodReceiptModel: Model<DetailGoodReceipt>,
    ) { }

    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% GOOD RECEIPT %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    // ======================================== POST =======================================
    async createGoodReceipt(createGoodReceiptDto: CreateGoodReceiptDto) {
        const { details, ...others } = createGoodReceiptDto;

        await this.getSupplierById(others.supplier);
        await this.checkConfirmerExist(others.confirmer);

        const newReceipt = new this.goodReceiptModel(others);
        const savedReceipt = await newReceipt.save();

        for (const item of details) {
            const newDetail = new this.detailGoodReceiptModel({ ...item, receipt: savedReceipt._id });
            await newDetail.save();
        }
    } // POST

    // ======================================== PUT ========================================
    // ======================================== GET ========================================
    // ======================================= DELETE ======================================


    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% SUPPLIER %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    async createSupplier(createSupplierDto: CreateSupplierDto) {
        const newSupplier = new this.supplierModel(createSupplierDto);
        await newSupplier.save();
    } // POST

    async getSupplierById(supId: Types.ObjectId) {
        const found = await this.supplierModel.findById(supId).select("-__v -createdAt -updatedAt");
        if (!found) throw new NotFoundException("Supplier not found!");
        return found;
    } // GET

    async updateSupplier(updateSupplierDto: UpdateSupplierDto) {
        const { supplier } = updateSupplierDto;
        const updated = await this.supplierModel.findByIdAndUpdate(
            supplier,
            { $set: updateSupplierDto },
        )
        if (!updated) throw new NotFoundException("Supplier not found!");
    } // PUT

    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% SPECIAL %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    async checkConfirmerExist(confirmer: Types.ObjectId): Promise<void> {
        const found = await this.userModel.findById(confirmer);
        if (!found) throw new NotFoundException("Confirmer not found!");
        if (found.role !== USER_ROLES.Admin && found.role !== USER_ROLES.Employee) throw new BadRequestException("Confirmer must be an Employee or Admin.");
    }
}
