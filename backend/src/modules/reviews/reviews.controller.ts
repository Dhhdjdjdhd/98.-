import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  // 리뷰 작성 (로그인 필수)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviews.create(dto);
  }

  // 특정 대상(근무자/부모)에 대한 리뷰 목록
  @Get()
  listByTarget(@Query('targetId') targetId: string) {
    return this.reviews.listByTarget(targetId);
  }
}
