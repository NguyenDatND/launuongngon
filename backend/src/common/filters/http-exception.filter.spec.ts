import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function makeHost(responseMock: { status: jest.Mock; json: jest.Mock }) {
  return {
    switchToHttp: () => ({
      getResponse: () => responseMock,
      getRequest: () => ({ method: 'GET', url: '/test' }),
    }),
  } as any;
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  });

  it('maps string-body HttpException to status-derived code', () => {
    const exc = new HttpException('Not found', HttpStatus.NOT_FOUND);
    filter.catch(exc, makeHost({ status: statusMock, json: jsonMock }));
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Not found', details: {} },
    });
  });

  it('maps object-body HttpException with explicit code', () => {
    const exc = new HttpException({ code: 'MY_CODE', message: 'custom' }, 400);
    filter.catch(exc, makeHost({ status: statusMock, json: jsonMock }));
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'MY_CODE', message: 'custom', details: {} },
    });
  });

  it('maps object-body HttpException without code to status-derived code', () => {
    const exc = new HttpException({ message: 'forbidden' }, 403);
    filter.catch(exc, makeHost({ status: statusMock, json: jsonMock }));
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'FORBIDDEN', message: 'forbidden', details: {} },
    });
  });

  it('maps array message to first element', () => {
    const exc = new HttpException({ message: ['field is required', 'field must be string'] }, 400);
    filter.catch(exc, makeHost({ status: statusMock, json: jsonMock }));
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'BAD_REQUEST', message: 'field is required', details: {} },
    });
  });

  it('maps unknown non-HttpException to INTERNAL_ERROR 500', () => {
    filter.catch(new Error('boom'), makeHost({ status: statusMock, json: jsonMock }));
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error', details: {} },
    });
  });
});
