/**
 * Provides HTTP status codes as constant values.
 * Each property represents a standard HTTP status code.
 *
 * @remarks
 * Use these constants to improve code readability and avoid magic numbers when working with HTTP responses.
 */
export const httpStatusCode = {
    /**
     * Standard response for successful HTTP requests.
     */
    ok: 200,
    /**
     * The request has been fulfilled and resulted in a new resource being created.
     */
    created: 201,
    /**
     * The request has been accepted for processing, but the processing has not been completed.
     */
    accepted: 202,
    /**
     * The server is a transforming proxy that received a 200 OK from its origin, but is returning a modified response.
     */
    nonAuthoritativeInformation: 203,
    /**
     * The server successfully processed the request and is not returning any content.
     */
    noContent: 204,
    /**
     * The server successfully processed the request, but is not returning any content and requires the requester to reset the document view.
     */
    resetContent: 205,
    /**
     * The server is delivering only part of the resource due to a range header sent by the client.
     */
    partialContent: 206,
    /**
     * The message body that follows is an XML message and can contain a number of separate response codes.
     */
    multiStatus: 207,
    /**
     * The members of a DAV binding have already been enumerated in a previous reply to this request, and are not being included again.
     */
    alreadyReported: 208,
    /**
     * The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.
     */
    imUsed: 226,
    /**
     * Indicates multiple options for the resource from which the client may choose.
     */
    multipleChoices: 300,
    /**
     * This and all future requests should be directed to the given URI.
     */
    movedPermanently: 301,
    /**
     * The resource was found but at a different URI.
     */
    found: 302,
    /**
     * The response to the request can be found under another URI using a GET method.
     */
    seeOther: 303,
    /**
     * Indicates that the resource has not been modified since the version specified by the request headers.
     */
    notModified: 304,
    /**
     * The requested resource is available only through a proxy, the address for which is provided in the response.
     */
    useProxy: 305,
    /**
     * In this case, the request should be repeated with another URI; however, future requests should still use the original URI.
     */
    temporaryRedirect: 307,
    /**
     * The request and all future requests should be repeated using another URI.
     */
    permanentRedirect: 308,
    /**
     * The server cannot or will not process the request due to an apparent client error.
     */
    badRequest: 400,
    /**
     * Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.
     */
    unauthorized: 401,
    /**
     * Reserved for future use.
     */
    paymentRequired: 402,
    /**
     * The request was valid, but the server is refusing action.
     */
    forbidden: 403,
    /**
     * The requested resource could not be found but may be available in the future.
     */
    notFound: 404,
    /**
     * A request method is not supported for the requested resource.
     */
    methodNotAllowed: 405,
    /**
     * The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.
     */
    notAcceptable: 406,
    /**
     * The client must first authenticate itself with the proxy.
     */
    proxyAuthenticationRequired: 407,
    /**
     * The server timed out waiting for the request.
     */
    requestTimeout: 408,
    /**
     * Indicates that the request could not be processed because of conflict in the request.
     */
    conflict: 409,
    /**
     * Indicates that the resource requested is no longer available and will not be available again.
     */
    gone: 410,
    /**
     * The request did not specify the length of its content, which is required by the requested resource.
     */
    lengthRequired: 411,
    /**
     * The server does not meet one of the preconditions that the requester put on the request.
     */
    preconditionFailed: 412,
    /**
     * The request is larger than the server is willing or able to process.
     */
    payloadTooLarge: 413,
    /**
     * The URI provided was too long for the server to process.
     */
    uriTooLong: 414,
    /**
     * The request entity has a media type which the server or resource does not support.
     */
    unsupportedMediaType: 415,
    /**
     * The client has asked for a portion of the file, but the server cannot supply that portion.
     */
    rangeNotSatisfiable: 416,
    /**
     * The server cannot meet the requirements of the Expect request-header field.
     */
    expectationFailed: 417,
    /**
     * This code was defined in 1998 as one of the traditional IETF April Fools' jokes.
     */
    imATeapot: 418,
    /**
     * The request was directed at a server that is not able to produce a response.
     */
    misdirectedRequest: 421,
    /**
     * The request was well-formed but was unable to be followed due to semantic errors.
     */
    unprocessableEntity: 422,
    /**
     * The resource that is being accessed is locked.
     */
    locked: 423,
    /**
     * The request failed due to failure of a previous request.
     */
    failedDependency: 424,
    /**
     * Indicates that the server is unwilling to risk processing a request that might be replayed.
     */
    tooEarly: 425,
    /**
     * The client should switch to a different protocol.
     */
    upgradeRequired: 426,
    /**
     * The origin server requires the request to be conditional.
     */
    preconditionRequired: 428,
    /**
     * The user has sent too many requests in a given amount of time.
     */
    tooManyRequests: 429,
    /**
     * The server is unwilling to process the request because its header fields are too large.
     */
    requestHeaderFieldsTooLarge: 431,
    /**
     * The server is denying access to the resource as a consequence of a legal demand.
     */
    unavailableForLegalReasons: 451,
    /**
     * A generic error message, given when an unexpected condition was encountered.
     */
    internalServerError: 500,
    /**
     * The server either does not recognize the request method, or it lacks the ability to fulfill the request.
     */
    notImplemented: 501,
    /**
     * The server was acting as a gateway or proxy and received an invalid response from the upstream server.
     */
    badGateway: 502,
    /**
     * The server is currently unavailable (because it is overloaded or down for maintenance).
     */
    serviceUnavailable: 503,
    /**
     * The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.
     */
    gatewayTimeout: 504,
    /**
     * The server does not support the HTTP protocol version used in the request.
     */
    httpVersionNotSupported: 505,
    /**
     * Transparent content negotiation for the request results in a circular reference.
     */
    variantAlsoNegotiates: 506,
    /**
     * The server is unable to store the representation needed to complete the request.
     */
    insufficientStorage: 507,
    /**
     * The server detected an infinite loop while processing the request.
     */
    loopDetected: 508,
    /**
     * Further extensions to the request are required for the server to fulfill it.
     */
    notExtended: 510,
    /**
     * The client needs to authenticate to gain network access.
     */
    networkAuthenticationRequired: 511
} as const;