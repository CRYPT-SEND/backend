"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletStatus = exports.WalletType = exports.OrderStatus = exports.UserStatus = exports.KYCStatus = exports.KYCLevel = void 0;
var KYCLevel;
(function (KYCLevel) {
    KYCLevel["L1"] = "L1";
    KYCLevel["L2"] = "L2";
    KYCLevel["L3"] = "L3";
})(KYCLevel || (exports.KYCLevel = KYCLevel = {}));
var KYCStatus;
(function (KYCStatus) {
    KYCStatus["PENDING"] = "PENDING";
    KYCStatus["APPROVED"] = "APPROVED";
    KYCStatus["REJECTED"] = "REJECTED";
    KYCStatus["EXPIRED"] = "EXPIRED";
})(KYCStatus || (exports.KYCStatus = KYCStatus = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["BLOCKED"] = "BLOCKED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["CREATED"] = "CREATED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["FAILED"] = "FAILED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var WalletType;
(function (WalletType) {
    WalletType["CUSTODIAL"] = "custodial";
    WalletType["SEMI_CUSTODIAL"] = "semi_custodial";
})(WalletType || (exports.WalletType = WalletType = {}));
var WalletStatus;
(function (WalletStatus) {
    WalletStatus["ACTIVE"] = "ACTIVE";
    WalletStatus["INACTIVE"] = "INACTIVE";
    WalletStatus["FROZEN"] = "FROZEN";
})(WalletStatus || (exports.WalletStatus = WalletStatus = {}));
