import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model, Types, Document } from 'mongoose';
import { Supplier } from 'src/schemas/supplier.schema';
import { RECEIPT_STATUS, USER_ROLES } from 'src/constants/schema.enum';
import { GoodReceipt } from 'src/schemas/goodReceipt.schema';
import { CreateGoodReceiptDto } from './dto/CreateGoodReceipt.dto';
import { DetailGoodReceipt } from 'src/schemas/detailGoodReceipt.schema';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
    DetailReceipt, GoodReceiptType, PaginationAllReceipt, PaginationAllSupplier
} from './types';
import {
    CreateSupplierDto, PaginationAllDto, PaginationKeywordDto, UpdateSupplierDto
} from './dto';

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
        console.log("createGoodReceiptDto: ", createGoodReceiptDto);

        const { details, ...others } = createGoodReceiptDto;

        await this.getSupplierById(others.supplier);
        await this.checkConfirmerExist(others.confirmer);

        const newReceipt = new this.goodReceiptModel({ ...others, receiptId: uuidv4() });
        const savedReceipt = await newReceipt.save();

        for (const item of details) {
            const newDetail = new this.detailGoodReceiptModel({ ...item, receipt: savedReceipt.receiptId });
            await newDetail.save();
        }
    } // POST

    // ======================================== PUT ========================================
    async updateReceiptToWarehouse(receiptId: string, updater: Types.ObjectId) {
        const update_date: Date = new Date();
        const result = await this.goodReceiptModel.findOneAndUpdate(
            { receiptId },
            { status: RECEIPT_STATUS.UPDATED, updater, update_date, }
        );
        if (!result) throw new NotFoundException("Receipt not found.");
    }

    // ======================================== GET ========================================
    async getDetailGoodReceiptById(receiptId: string): Promise<DetailReceipt> {
        const foundReceipt = await this.goodReceiptModel.findOne({ receiptId: receiptId }).select("-createdAt -updatedAt -__v");
        if (!foundReceipt) throw new NotFoundException("Good Receipt not found!");
        const supplier = await this.supplierModel.findById(foundReceipt.supplier);
        const confirmer = await this.userModel.findById(foundReceipt.confirmer);
        const updater = await this.userModel.findById(foundReceipt.updater);
        const detailReceipt = await this.detailGoodReceiptModel.find({ receipt: receiptId }).select(" -createdAt -updatedAt -__v");
        const result: DetailReceipt = {
            receiptId: foundReceipt.receiptId,
            supplier: supplier.supplier_name,
            confirmer: confirmer.fullName,
            confirmation_date: moment(foundReceipt.confirmation_date).format("DD/MM/YYYY"),
            updater: updater.fullName,
            update_date: moment(foundReceipt.update_date).format("DD/MM/YYYY"),
            status: foundReceipt.status,
            total_receipt: foundReceipt.total,
            notes: foundReceipt.notes,
            details: detailReceipt,
        };

        return result;
    }

    async getAllGoodReceipt(paginationAllDto: PaginationAllDto) {
        const pageSize = paginationAllDto.pageSize || 6;
        const pageNumber = paginationAllDto.pageNumber || 1;
        const listReceipts = await this.goodReceiptModel.find().select("-createdAt -updatedAt -__v -_id");

        return await this.handleResponseGetList(pageSize, pageNumber, listReceipts);
    }

    async findReceiptByKeyword(paginationKeywordDto: PaginationKeywordDto) {
        const keyword = paginationKeywordDto.keyword;
        const pageSize = paginationKeywordDto.pageSize || 6;
        const pageNumber = paginationKeywordDto.pageNumber || 1;
        const listReceipts = await this.goodReceiptModel.find().select("-createdAt -updatedAt -__v -_id");

        return await this.handleResponseFindByKeyword(keyword, pageSize, pageNumber, listReceipts);
    }

    // ======================================= DELETE ======================================
    async deleteAllReceipts(): Promise<void> {
        await this.goodReceiptModel.deleteMany({});
        await this.detailGoodReceiptModel.deleteMany({});
    }

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

    async getAllSupplier(paginationAllDto: PaginationAllDto) {
        const pageSize = paginationAllDto.pageSize || 6;
        const pageNumber = paginationAllDto.pageNumber || 1;
        const listSuppliers = await this.supplierModel.find().select("-createdAt -updatedAt -__v").lean();

        const pages: number = Math.ceil(listSuppliers.length / pageSize);
        const semiFinal = listSuppliers.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

        const final = [];
        for (const supplier of semiFinal) {
            const totalReceipt = await this.goodReceiptModel.find({ supplier: supplier });
            const item = { ...supplier, total_receipt: totalReceipt.length };
            final.push(item);
        }

        const result: PaginationAllSupplier = { pages: pages, data: final }

        return result;
    } // GET

    async findSupplierByKeyword(paginationKeywordDto: PaginationKeywordDto) {
        const keyword = paginationKeywordDto.keyword;
        const pageSize = paginationKeywordDto.pageSize || 6;
        const pageNumber = paginationKeywordDto.pageNumber || 1;

        const listSuppliers = await this.supplierModel.find({
            $or: [
                { 'email': { $regex: keyword, $options: 'i' } },
                { 'address': { $regex: keyword, $options: 'i' } },
                { 'supplier_name': { $regex: keyword, $options: 'i' } },
                { 'contacter_name': { $regex: keyword, $options: 'i' } },
            ]
        }).select("-createdAt -updatedAt -__v").lean();

        const pages: number = Math.ceil(listSuppliers.length / pageSize);
        const semiFinal = listSuppliers.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

        const final = [];
        for (const supplier of semiFinal) {
            const totalReceipt = await this.goodReceiptModel.find({ supplier: supplier });
            const item = { ...supplier, total_receipt: totalReceipt.length };
            final.push(item);
        }

        const result: PaginationAllSupplier = { pages: pages, data: final }

        return result;
    }

    async updateSupplier(updateSupplierDto: UpdateSupplierDto) {
        const { supplier } = updateSupplierDto;
        const updated = await this.supplierModel.findByIdAndUpdate(
            supplier,
            { $set: updateSupplierDto },
        )
        if (!updated) throw new NotFoundException("Supplier not found!");
    } // PUT

    async deleteSupplierById(supId: Types.ObjectId): Promise<void> {
        const deleted = await this.supplierModel.findByIdAndDelete(supId);
        if (!deleted) throw new NotFoundException("Supplier not found!");
    } // DELETE

    async deleteAllSuppliers(): Promise<void> {
        await this.supplierModel.deleteMany({});
    } // DELETE

    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% SPECIAL %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    async checkConfirmerExist(confirmer: Types.ObjectId): Promise<void> {
        const found = await this.userModel.findById(confirmer);
        if (!found) throw new NotFoundException("Confirmer not found!");
        if (found.role !== USER_ROLES.Admin && found.role !== USER_ROLES.Employee) throw new BadRequestException("Confirmer must be an Employee or Admin.");
    }

    async fillInfoGoodReceipts(listReceipts: (Document<unknown, {}, GoodReceipt> & GoodReceipt & { _id: Types.ObjectId; })[]) {
        const result = [];
        for (const receipt of listReceipts) {
            const supplier = await this.supplierModel.findById(receipt.supplier);
            const confirmer = await this.userModel.findById(receipt.confirmer);
            const item: GoodReceiptType = {
                receiptId: receipt.receiptId,
                supplier: supplier.supplier_name,
                confirmer: confirmer.fullName,
                confirmation_date: moment(receipt.confirmation_date).format("DD/MM/YYYY"),
                total_receipt: receipt.total,
                notes: receipt.notes,
                status: receipt.status,
            }
            result.push(item);
        }
        return result;
    }

    async handleResponseGetList(pageSize: number, pageNumber: number, listReceipts: (Document<unknown, {}, GoodReceipt> & GoodReceipt & { _id: Types.ObjectId; })[]) {

        const pages: number = Math.ceil(listReceipts.length / pageSize);
        const semiFinal = listReceipts.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        const final: GoodReceiptType[] = await this.fillInfoGoodReceipts(semiFinal);
        const result: PaginationAllReceipt = { pages: pages, data: final }

        return result;
    }

    async handleResponseFindByKeyword(keyword: string, pageSize: number, pageNumber: number, listReceipts: (Document<unknown, {}, GoodReceipt> & GoodReceipt & { _id: Types.ObjectId; })[]) {
        const regexKeyword = new RegExp(keyword, 'i');
        const newListReceipts: GoodReceiptType[] = await this.fillInfoGoodReceipts(listReceipts);

        const semiFinal = newListReceipts.filter(receipt =>
            regexKeyword.test(receipt.supplier) || regexKeyword.test(receipt.confirmer) || regexKeyword.test(receipt.receiptId)
        );

        const pages: number = Math.ceil(listReceipts.length / pageSize);
        const final = semiFinal.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        const result: PaginationAllReceipt = { pages: pages, data: final }

        return result;
    }
}
