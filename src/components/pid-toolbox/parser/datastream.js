"use strict";
import {
  signExtend8Bit,
  signExtend16Bit,
  signExtend2Bit,
  signExtend4Bit,
  signExtend6Bit,
  signExtend24Bit,
} from "./tools";

var EOF = -1;

/*
 * Take an array of unsigned byte data and present it as a stream with various methods
 * for reading data in different formats.
 */
export const ArrayDataStream = function (data, start, end) {
  this.data = data;
  this.eof = false;
  this.start = start === undefined ? 0 : start;
  this.end = end === undefined ? data.length : end;
  this.pos = this.start;
};

/**
 * Read a single byte from the string and turn it into a JavaScript string (assuming ASCII).
 *
 * @returns String containing one character, or EOF if the end of file was reached (eof flag
 * is set).
 */
ArrayDataStream.prototype.readChar = function () {
  if (this.pos < this.end) return String.fromCharCode(this.data[this.pos++]);

  this.eof = true;
  return EOF;
};

/**
 * Read one unsigned byte from the stream
 *
 * @returns Unsigned byte, or EOF if the end of file was reached (eof flag is set).
 */
ArrayDataStream.prototype.readByte = function () {
  if (this.pos < this.end) return this.data[this.pos++];

  this.eof = true;
  return EOF;
};

//Synonym:
ArrayDataStream.prototype.readU8 = ArrayDataStream.prototype.readByte;

ArrayDataStream.prototype.readS8 = function () {
  return signExtend8Bit(this.readByte());
};

ArrayDataStream.prototype.unreadChar = function () {
  this.pos--;
};

ArrayDataStream.prototype.peekChar = function () {
  if (this.pos < this.end) return String.fromCharCode(this.data[this.pos]);

  this.eof = true;
  return EOF;
};

/**
 * Read a (maximally 32-bit) unsigned integer from the stream which was encoded in Variable Byte format.
 *
 * @returns the unsigned integer, or 0 if a valid integer could not be read (EOF was reached or integer format
 * was invalid).
 */
ArrayDataStream.prototype.readUnsignedVB = function () {
  var i,
    b,
    shift = 0,
    result = 0;

  // 5 bytes is enough to encode 32-bit unsigned quantities
  for (i = 0; i < 5; i++) {
    b = this.readByte();

    if (b == EOF) return 0;

    result = result | ((b & ~0x80) << shift);

    // Final byte?
    if (b < 128) {
      /*
       * Force the 32-bit integer to be reinterpreted as unsigned by doing an unsigned right shift, so that
       * the top bit being set doesn't cause it to interpreted as a negative number.
       */
      return result >>> 0;
    }

    shift += 7;
  }

  // This VB-encoded int is too long!
  return 0;
};

ArrayDataStream.prototype.readSignedVB = function () {
  var unsigned = this.readUnsignedVB();

  // Apply ZigZag decoding to recover the signed value
  return (unsigned >>> 1) ^ -(unsigned & 1);
};

ArrayDataStream.prototype.readString = function (length) {
  var chars = new Array(length),
    i;

  for (i = 0; i < length; i++) {
    chars[i] = this.readChar();
  }

  return chars.join("");
};

ArrayDataStream.prototype.readS16 = function () {
  var b1 = this.readByte(),
    b2 = this.readByte();

  return signExtend16Bit(b1 | (b2 << 8));
};

ArrayDataStream.prototype.readU16 = function () {
  var b1 = this.readByte(),
    b2 = this.readByte();

  return b1 | (b2 << 8);
};

ArrayDataStream.prototype.readU32 = function () {
  var b1 = this.readByte(),
    b2 = this.readByte(),
    b3 = this.readByte(),
    b4 = this.readByte();
  return b1 | (b2 << 8) | (b3 << 16) | (b4 << 24);
};

/**
 * Search for the string 'needle' beginning from the current stream position up
 * to the end position. Return the offset of the first occurance found.
 *
 * @param needle
 *            String to search for
 * @returns Position of the start of needle in the stream, or -1 if it wasn't
 *          found
 */
ArrayDataStream.prototype.nextOffsetOf = function (needle) {
  var i, j;

  for (i = this.pos; i <= this.end - needle.length; i++) {
    if (this.data[i] == needle[0]) {
      for (j = 1; j < needle.length && this.data[i + j] == needle[j]; j++);

      if (j == needle.length) return i;
    }
  }

  return -1;
};

ArrayDataStream.prototype.readTag2_3S32 = function (values) {
  var leadByte, byte1, byte2, byte3, byte4, i;

  leadByte = this.readByte();

  // Check the selector in the top two bits to determine the field layout
  switch (leadByte >> 6) {
    case 0:
      // 2-bit fields
      values[0] = signExtend2Bit((leadByte >> 4) & 0x03);
      values[1] = signExtend2Bit((leadByte >> 2) & 0x03);
      values[2] = signExtend2Bit(leadByte & 0x03);
      break;
    case 1:
      // 4-bit fields
      values[0] = signExtend4Bit(leadByte & 0x0f);

      leadByte = this.readByte();

      values[1] = signExtend4Bit(leadByte >> 4);
      values[2] = signExtend4Bit(leadByte & 0x0f);
      break;
    case 2:
      // 6-bit fields
      values[0] = signExtend6Bit(leadByte & 0x3f);

      leadByte = this.readByte();
      values[1] = signExtend6Bit(leadByte & 0x3f);

      leadByte = this.readByte();
      values[2] = signExtend6Bit(leadByte & 0x3f);
      break;
    case 3:
      // Fields are 8, 16 or 24 bits, read selector to figure out which field is which size

      for (i = 0; i < 3; i++) {
        switch (leadByte & 0x03) {
          case 0: // 8-bit
            byte1 = this.readByte();

            // Sign extend to 32 bits
            values[i] = signExtend8Bit(byte1);
            break;
          case 1: // 16-bit
            byte1 = this.readByte();
            byte2 = this.readByte();

            // Sign extend to 32 bits
            values[i] = signExtend16Bit(byte1 | (byte2 << 8));
            break;
          case 2: // 24-bit
            byte1 = this.readByte();
            byte2 = this.readByte();
            byte3 = this.readByte();

            values[i] = signExtend24Bit(byte1 | (byte2 << 8) | (byte3 << 16));
            break;
          case 3: // 32-bit
            byte1 = this.readByte();
            byte2 = this.readByte();
            byte3 = this.readByte();
            byte4 = this.readByte();

            values[i] = byte1 | (byte2 << 8) | (byte3 << 16) | (byte4 << 24);
            break;
        }

        leadByte >>= 2;
      }
      break;
  }
};

ArrayDataStream.prototype.readTag8_4S16_v2 = function(values) {
  var 
      selector, i,
      char1, char2,
      buffer,
      nibbleIndex,

      FIELD_ZERO  = 0,
      FIELD_4BIT  = 1,
      FIELD_8BIT  = 2,
      FIELD_16BIT = 3;

  selector = this.readByte();

  //Read the 4 values from the stream
  nibbleIndex = 0;
  for (i = 0; i < 4; i++) {
      switch (selector & 0x03) {
          case FIELD_ZERO:
              values[i] = 0;
          break;
          case FIELD_4BIT:
              if (nibbleIndex === 0) {
                  buffer = this.readByte();
                  values[i] = signExtend4Bit(buffer >> 4);
                  nibbleIndex = 1;
              } else {
                  values[i] = signExtend4Bit(buffer & 0x0F);
                  nibbleIndex = 0;
              }
          break;
          case FIELD_8BIT:
              if (nibbleIndex === 0) {
                  values[i] = signExtend8Bit(this.readByte());
              } else {
                  char1 = (buffer & 0x0F) << 4;
                  buffer = this.readByte();

                  char1 |= buffer >> 4;
                  values[i] = signExtend8Bit(char1);
              }
          break;
          case FIELD_16BIT:
              if (nibbleIndex === 0) {
                  char1 = this.readByte();
                  char2 = this.readByte();

                  //Sign extend...
                  values[i] = signExtend16Bit((char1 << 8) | char2);
              } else {
                  /*
                   * We're in the low 4 bits of the current buffer, then one byte, then the high 4 bits of the next
                   * buffer.
                   */
                  char1 = this.readByte();
                  char2 = this.readByte();

                  values[i] = signExtend16Bit(((buffer & 0x0F) << 12) | (char1 << 4) | (char2 >> 4));

                  buffer = char2;
              }
          break;
      }

      selector >>= 2;
  }
};

ArrayDataStream.prototype.readTag8_8SVB = function(values, valueCount) {
  var 
      i, header;

  if (valueCount == 1) {
      values[0] = this.readSignedVB();
  } else {
      header = this.readByte();

      for (i = 0; i < 8; i++, header >>= 1)
          values[i] = (header & 0x01) ? this.readSignedVB() : 0;
  }
};

ArrayDataStream.prototype.EOF = EOF;
