/**
 * DomainErrorKeys is an enum that contains the error codes for the domain layer.
 */
export enum DomainErrorKeys {
    ERROR_PACKAGE_JSON_EXISTS = 'error.domain.service.error_package_json_exists',
    ERROR_TS_CONFIG_EXISTS = 'error.domain.service.error_ts_config_exists',
    ERROR_ESLINT_EXISTS = 'error.domain.service.error_eslint_exists',
    ERROR_ANDESITE_YML_EXISTS = 'error.domain.service.error_andesite_yml_exists',
    ERROR_ANDESITE_YML_INVALID_CONFIG = 'error.domain.service.error_andesite_yml_invalid_config',
    ERROR_ENTRY_POINT_EXISTS = 'error.domain.service.error_entry_point_exists',
    ERROR_CANCEL_PROMPT = 'error.domain.service.error_cancel_prompt',

    ERROR_CLASS_CONSTRUCTOR_ALREADY_REGISTERED = 'error.domain.service.class_constructor_already_registered',
    ERROR_CLASS_CONSTRUCTOR_NOT_REGISTERED = 'error.domain.service.class_constructor_not_registered',
 }
