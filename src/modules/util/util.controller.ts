import { UtilService } from './util.service';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateBankDto, CreateDistrictDto, CreateProvinceDto, CreateWardDto, UpdateDistrictDto } from './dto';

@Controller('utils')
export class UtilController {
    constructor(private readonly utilService: UtilService) { }

    @Get("banks")
    async getBanks() {
        const result = await this.utilService.getBanks();
        return { message: "Get Banks succeed.", result }
    }

    @Get("provinces")
    async getProvinces() {
        const result = await this.utilService.getProvinces();
        return { message: "Get Provinces succeed.", result }
    }

    @Get("provinces/districts/:provinceId")
    async getDistrictsOfProvince(@Param("provinceId") provinceId: string) {
        const result = await this.utilService.getDistrictsOfProvince(provinceId);
        return { message: "Get Provinces succeed.", result }
    }

    @Get("provinces/districts/wards/:districtId")
    async getWardsOfDistrict(@Param("districtId") districtId: string) {
        const result = await this.utilService.getWardsOfDistrict(districtId);
        return { message: "Get Provinces succeed.", result }
    }

    @Put("districts")
    async updateDistrict(@Body() updateDistrictDto: UpdateDistrictDto) {
        const result = await this.utilService.updateDistrist(updateDistrictDto);
        return { message: "Get Provinces succeed.", result }
    }

    @Post("banks")
    async createBankList(@Body() createBankListDto: CreateBankDto[]) {
        await this.utilService.createBankList(createBankListDto);
        return { mewssage: "Create Bank List succeed." }
    }

    // @Post("provinces")
    // async createProvinceList(@Body() createProvinceListDto: CreateProvinceDto[]) {
    //     await this.utilService.createProvinceList(createProvinceListDto);
    //     return { mewssage: "Create Province List succeed." }
    // }

    // @Post("districts")
    // async createDistrictList(@Body() createDistrictListDto: CreateDistrictDto[]) {
    //     await this.utilService.createDistrictList(createDistrictListDto);
    //     return { mewssage: "Create District List succeed." }
    // }

    // @Post("wards")
    // async createWardList(@Body() createWardListDto: CreateWardDto[]) {
    //     await this.utilService.createWardList(createWardListDto);
    //     return { mewssage: "Create Ward List succeed." }
    // }
}
