"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUser = createTestUser;
exports.createRegistrationData = createRegistrationData;
// test/factories/user.factory.ts
const faker_1 = require("@faker-js/faker");
function createTestUser(overrides = {}) {
    return {
        email: faker_1.faker.internet.email(),
        password: faker_1.faker.internet.password({ length: 12, memorable: true }),
        firstName: faker_1.faker.person.firstName(),
        lastName: faker_1.faker.person.lastName(),
        phone: faker_1.faker.phone.number(),
        country: faker_1.faker.location.countryCode('alpha-2'),
        preferredCurrency: 'EUR',
        ...overrides,
    };
}
function createRegistrationData(step = 1, overrides = {}) {
    const base = createTestUser(overrides);
    switch (step) {
        case 1:
            return { email: base.email, password: base.password };
        case 2:
            return {
                firstName: base.firstName,
                lastName: base.lastName,
            };
        case 3:
            return {
                phone: base.phone,
                country: base.country,
            };
        case 4:
            return {
                preferredCurrency: base.preferredCurrency,
                acceptTerms: true,
            };
        default:
            return base;
    }
}
