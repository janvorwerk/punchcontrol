export type ApiErrorCode =
    'DatabaseError' |
    'InternalError' |
    'ConcurrentModification';

export interface ApiError {
    name: ApiErrorCode;
    message: string;
}

export enum RestApiStatusCodes {
    SUCCESS_200_OK = 200, // OK w/ return value
    SUCCESS_201_CREATED = 201, // a resource was created OK
    SUCCESS_202_ACCEPTED = 202, // a long running request was started
    SUCCESS_204_NO_CONTENT = 204, // operation OK w/o return value

    CLIENT_400_BAD_REQUEST = 400, // Generic error
    CLIENT_401_UNAUTHORIZED = 401, // No auth provided
    CLIENT_403_FORBIDDEN = 403, // The provided credentials do not allow the request
    CLIENT_404_NOT_FOUND = 404, // A resource was not found
    CLIENT_405_METHOD_NOT_ALLOWED = 405, // POST on a GET etc...
    CLIENT_406_NOT_ACCEPTABLE = 406, // Content-Type not understood
    CLIENT_409_CONFLICT = 409, // Resource modified by someone else
    CLIENT_412_PRECONDITION_FAILED = 412, // Request is invalid in the current server state

    SERVER_500_INTERNAL_SERVER_ERROR = 500, // Generic server error
    SERVER_501_NOT_IMPLEMENTED = 501, // A feature is not yet implemented
    SERVER_503_SERVICE_UNAVAILABLE = 503 // The service is down or suspended (DB not opened, ...)
}
