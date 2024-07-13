import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponController } from './coupon.controller';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Coupon, CouponSchema } from 'src/schemas/coupon.schema';
import { UserCoupon, UserCouponSchema } from 'src/schemas/userCoupon.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: UserCoupon.name, schema: UserCouponSchema },
    ]),
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule { }
