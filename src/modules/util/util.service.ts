import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UtilWard } from 'src/schemas/utilWard.schema';
import { UtilDistrict } from 'src/schemas/utilDistrict.schema';
import { UtilProvince } from 'src/schemas/utilProvince.schema';
import { CreateBankDto, CreateDistrictDto, CreateProvinceDto, CreateWardDto, UpdateDistrictDto } from './dto';
import { UtilBank } from 'src/schemas/utilBank.schema';

@Injectable()
export class UtilService {
    constructor(
        @InjectModel(UtilWard.name) private readonly utilWardModel: Model<UtilWard>,
        @InjectModel(UtilBank.name) private readonly utilBankModel: Model<UtilBank>,
        @InjectModel(UtilDistrict.name) private readonly utilDistrictModel: Model<UtilDistrict>,
        @InjectModel(UtilProvince.name) private readonly utilProvincewModel: Model<UtilProvince>,
    ) { }

    async getBanks() {
        return await this.utilBankModel.find({}).select("bank_name");
    }

    async getProvinces() {
        return await this.utilProvincewModel.find({}).select("-_id -__v -createdAt -updatedAt");
    }

    async getDistrictsOfProvince(provinceId: string) {
        return await this.utilDistrictModel.find({ provinceId: provinceId }).select("-_id -__v -createdAt -updatedAt");
    }

    async getWardsOfDistrict(districtId: string) {
        return await this.utilWardModel.find({ districtId: districtId }).select("-_id -__v -createdAt -updatedAt");
    }

    async updateDistrist(updateDistrictDto: UpdateDistrictDto) {
        return await this.utilDistrictModel.findOneAndUpdate(
            { districtId: updateDistrictDto.districtId },
            { $set: { district_name: updateDistrictDto.district_name, district_type: updateDistrictDto.district_type } }
        );
    }

    async createBankList(createBankListDto: CreateBankDto[]) {
        for (const item of createBankListDto) {
            await this.createBank(item);
        }
    }

    async createBank(createBankDto: CreateBankDto) {
        const newBank = new this.utilBankModel(createBankDto);
        await newBank.save();
    }

    // async createProvinceList(createProvinceListDto: CreateProvinceDto[]) {
    //     for (const item of createProvinceListDto) {
    //         await this.createProvince(item);
    //     }
    // }

    // async createDistrictList(createDistrictListDto: CreateDistrictDto[]) {
    //     for (const item of createDistrictListDto) {
    //         await this.createDistrict(item);
    //     }
    // }

    // async createWardList(createWardListDto: CreateWardDto[]) {
    //     for (const item of createWardListDto) {
    //         await this.createWard(item);
    //     }
    // }

    // async createProvince(createProvinceDto: CreateProvinceDto) {
    //     const newProvince = new this.utilProvincewModel(createProvinceDto);
    //     await newProvince.save();
    // }

    // async createDistrict(createDistrictDto: CreateDistrictDto) {
    //     const newDistrict = new this.utilDistrictModel(createDistrictDto);
    //     await newDistrict.save();
    // }

    // async createWard(createWardDto: CreateWardDto) {
    //     const newWard = new this.utilWardModel(createWardDto);
    //     await newWard.save();
    // }
}
