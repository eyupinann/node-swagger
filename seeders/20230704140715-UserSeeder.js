'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        email: 'eyup@example.com',
        name: 'Eyup Doe',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Diğer kullanıcıları buraya ekleyin
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
