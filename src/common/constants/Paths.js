"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    Base: '/api',
    Users: {
        Base: '/users',
        Get: '/all',
        Add: '/add',
        Update: '/update',
        Delete: '/delete/:id',
    },
    Admin: {
        Base: '/admin',
        Users: {
            Add: '/users', // POST pour créer un utilisateur
            Get: '/users',
            Update: '/users/:userId', // PUT pour modifier
            // etc.
        }
    }
};
