import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { USER_STATUS } from "src/constants/schema.enum";
import { User } from "src/schemas/User.schema";
import { compare, encode } from "src/utils/bcrypt/bcrypt";
import { GetByEmailDto, GetByStatusDto, UpdateUserDto, GetAllDto, UpdatePasswordDto, UpdateEmailDto, FindByKeywordDto } from "./dto";
import { GetAllRes } from "./types";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    // PATCH - PUT ========================================
    async updateSpent(userId: Types.ObjectId, spent: number): Promise<void> {
        const result = await this.userModel.findByIdAndUpdate(
            userId,
            { $inc: { spent: spent } }
        )
        if (!result) throw new NotFoundException("User Not Found");
    }

    async updateEmail(updateEmailDto: UpdateEmailDto): Promise<void> {
        const result = await this.userModel.findByIdAndUpdate(
            updateEmailDto.user,
            { $set: { email: updateEmailDto.email } }
        )
        if (!result) throw new NotFoundException("User Not Found");
    }

    async updatePassword(updatePasswordDto: UpdatePasswordDto): Promise<void> {
        const found = await this.userModel.findById(updatePasswordDto.user);
        if (!found) throw new NotFoundException("User Not Found");

        const isCorrect = await compare(updatePasswordDto.oldPassword, found.password);
        if (!isCorrect) throw new UnauthorizedException("Old Password incorrect.");

        const newPass = await encode(updatePasswordDto.newPassword);
        found.password = newPass;
        await found.save();
    }

    async updateAvatar(userId: Types.ObjectId, img: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(
            userId,
            { $set: { avatar: img } }
        )
    }

    async update(updateUserDto: UpdateUserDto): Promise<void> {
        const { user, ...others } = updateUserDto;
        const result = await this.userModel.findByIdAndUpdate(
            updateUserDto.user,
            { $set: others }
        )
        if (!result) throw new NotFoundException("User Not Found");
    }

    async lock(userId: Types.ObjectId): Promise<void> {
        const found = await this.userModel.findById(userId);
        if (!found) throw new NotFoundException("User Not Found");
        if (found.status === USER_STATUS.Locked) throw new ConflictException("User is already locked.");

        found.status = USER_STATUS.Locked;
        await found.save();
    }

    async unLock(userId: Types.ObjectId): Promise<void> {
        const found = await this.userModel.findById(userId);
        if (!found) throw new NotFoundException("User Not Found");
        if (found.status === USER_STATUS.Locked) throw new ConflictException("User is already active.");

        found.status = USER_STATUS.Active;
        await found.save();
    }

    // GET ========================================
    async getByKeyword(findByKeywordDto: FindByKeywordDto): Promise<GetAllRes> {
        const keyword = findByKeywordDto.keyword;
        const pageSize = findByKeywordDto.pageSize || 1;
        const pageNumber = findByKeywordDto.pageNumber || 1;
        const found = await this.userModel.find({
            $or: [
                { email: { $regex: keyword, $options: 'i' } },
                { fullName: { $regex: keyword, $options: 'i' } },
                { gender: { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } },
                { status: { $regex: keyword, $options: 'i' } },
                { role: { $regex: keyword, $options: 'i' } },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .select('-__v -createdAt -updatedAt -password');

        if (!found) throw new NotFoundException("User Not Found");

        const pages: number = Math.ceil(found.length / pageSize);
        const result: GetAllRes = {
            pages: pages,
            data: found,
        }

        return result;
    }

    async getByEmail(getByEmailDto: GetByEmailDto): Promise<User> {
        const result = await this.userModel.findOne({ email: getByEmailDto.email })
            .select('-__v -createdAt -updatedAt -password -role -status');
        if (!result) throw new NotFoundException("User Not Found");
        return result;
    }

    async getById(userId: Types.ObjectId): Promise<User> {
        const result = await this.userModel.findById(userId).select('-__v -createdAt -updatedAt -password -role -status');
        if (!result) throw new NotFoundException("User not found.");
        return result;
    }

    async getByStatus(getByStatusDto: GetByStatusDto): Promise<GetAllRes> {
        const pageSize = getByStatusDto.pageSize || 1;
        const pageNumber = getByStatusDto.pageSize || 1;
        const found = await this.userModel.find({ status: getByStatusDto.status })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .select('-__v -createdAt -updatedAt');
        const pages: number = Math.ceil(found.length / pageSize);
        const result: GetAllRes = {
            pages: pages,
            data: found,
        }
        return result;
    }

    async getAll(getAllDto: GetAllDto): Promise<GetAllRes> {
        const pageSize = getAllDto.pageSize || 1;
        const pageNumber = getAllDto.pageSize || 1;
        const found = await this.userModel.find()
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1))
            .select('-__v -createdAt -updatedAt');
        const pages: number = Math.ceil(found.length / pageSize);
        const result: GetAllRes = {
            pages: pages,
            data: found,
        }
        return result;
    }

    // DELETE ========================================
    async deleteAll(): Promise<void> {
        await this.userModel.deleteMany({});
    }
}