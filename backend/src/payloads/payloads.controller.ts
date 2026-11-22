import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePayloadDto } from './dto/create-payload.dto';
import { UpdatePayloadDto } from './dto/update-payload.dto';
import { PayloadsService } from './payloads.service';

/**
 * PayloadsController mengelola endpoint RESTful API untuk resource Payload.
 * Seluruh operasi memanggil PayloadsService via Dependency Injection.
 */
@Controller('payloads')
export class PayloadsController {
  constructor(private readonly payloadsService: PayloadsService) {}

  /**
   * HTTP POST /payloads
   * Menambahkan payload baru ke buffer memori volatile.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPayloadDto: CreatePayloadDto) {
    return this.payloadsService.create(createPayloadDto);
  }

  /**
   * HTTP GET /payloads
   * Mengambil seluruh payload yang sedang tersimpan di buffer RAM.
   */
  @Get()
  findAll() {
    return this.payloadsService.findAll();
  }

  /**
   * HTTP GET /payloads/:id
   * Mengambil detail satu payload berdasarkan ID uniknya.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payloadsService.findOne(id);
  }

  /**
   * HTTP PATCH /payloads/:id
   * Memperbarui sebagian data payload berdasarkan ID.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePayloadDto: UpdatePayloadDto,
  ) {
    return this.payloadsService.update(id, updatePayloadDto);
  }

  /**
   * HTTP DELETE /payloads/:id
   * Menghapus (sublimasi) payload dari buffer memori.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payloadsService.remove(id);
  }

  /**
   * HTTP GET /payloads/stats/count?type=file
   * Bonus advanced query: count payloads, optionally filtered by type.
   * Two-segment path avoids collision with the ':id' route above.
   */
  @Get('stats/count')
  count(@Query('type') type?: 'file' | 'link' | 'text') {
    return this.payloadsService.countByType(type);
  }
}
