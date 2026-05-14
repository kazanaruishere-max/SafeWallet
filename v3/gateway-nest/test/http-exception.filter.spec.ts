import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

jest.mock('@sentry/nestjs');

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and return formatted response', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const mockRequest = {
      url: '/test',
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        path: '/test',
        error: 'Forbidden',
      }),
    );
  });

  it('should catch generic error and return 500 status', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const mockRequest = {
      url: '/test',
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exception = new Error('Generic error');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(Sentry.captureException).toHaveBeenCalledWith(exception);
  });
});
