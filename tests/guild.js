/*
 * Copyright 2018 Liara A. M. Roervig
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const mongoose = require('mongoose');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const assert = chai.assert;
const ModelGuild = require('../src/guild.js');

const DB_URI = process.env.DB_URI || 'mongodb://localhost/AsyndDatabaseModels_Test';

describe('ModelGuild', () => {
    before(done => {
        mongoose.connect(DB_URI, {
            promiseLibrary: Promise
        });

        done();
    });

    it('Should set the default values', async () => {
        let guild = await ModelGuild.create({
            name: 'Should set the default values',
            discord_id: 2400000
        });

        assert.strictEqual(guild.cmd_prefix, ModelGuild.DEFAULTS.PREFIX, 'cmd prefix strictly equal to default prefix');
        assert.deepEqual(guild.settings.join_messages, ModelGuild.DEFAULTS.JOIN_MESSAGES, 'join messages deeply equal to default join messages');
        assert.deepEqual(guild.settings.leave_messages, ModelGuild.DEFAULTS.LEAVE_MESSAGES, 'leave messages deeply equal to default leave messages');
        assert.strictEqual(guild.settings.levelling_enabled, ModelGuild.DEFAULTS.LEVELLING_ENABLED, 'levelling enabled strictly equal to default levelling enabled');
    });

    it('setName to throw an error if the name is invalid', async () => {
        let guild = await ModelGuild.create({
            name: 'setName to throw an error if the name is longer than 100 characters',
            discord_id: 2400002
        });

        assert.isRejected(guild.setName('1'), 'Invalid name');
        assert.isRejected(guild.setName('After time adrift among open starts, along tides of light and to shoals of dust. I will return to where I began. Keelah se\'lai'), 'Invalid name');
    });

    it('setName should set the name and save it', async () => {
        let guild = await ModelGuild.create({
            name: 'setName should set the name and save it',
            discord_id: 2400003
        });

        await guild.setName('setName should set the name and save it v2');

        assert.strictEqual(guild.name, 'setName should set the name and save it v2', 'name should be updated and saved');
    });

    it('addJoinLeaveMessage to throw an error if the action is neither join nor leave', async () => {
        let guild = await ModelGuild.create({
            name: 'addJoinLeaveMessage to throw an error if the action is neither join nor leave',
            discord_id: 2400004
        });

        assert.isRejected(guild.addJoinLeaveMessage(undefined, 'Some message'), 'The action have to be either join or leave');
        assert.isRejected(guild.addJoinLeaveMessage(null, 'Some message'), 'The action have to be either join or leave');
        assert.isRejected(guild.addJoinLeaveMessage(1, 'Some message'), 'The action have to be either join or leave');
        assert.isRejected(guild.addJoinLeaveMessage(-1, 'Some message'), 'The action have to be either join or leave');
        assert.isRejected(guild.addJoinLeaveMessage('some string', 'Some message'), 'The action have to be either join or leave');
        assert.isRejected(guild.addJoinLeaveMessage({}, 'Some message'), 'The action have to be either join or leave');
    });

    it('addJoinLeaveMessage add messages to the join array', async () => {
        let guild = await ModelGuild.create({
            name: 'addJoinLeaveMessage add messages to the join array',
            discord_id: 2400005
        });

        await guild.addJoinLeaveMessage('join', '%USER% joined the mocha test');
        let assert_array = ModelGuild.DEFAULTS.JOIN_MESSAGES.concat(['%USER% joined the mocha test']);

        assert.deepEqual(guild.settings.join_messages, assert_array);
    });

    it('addJoinLeaveMessage add messages to the leave array', async () => {
        let guild = await ModelGuild.create({
            name: 'addJoinLeaveMessage add messages to the leave array',
            discord_id: 2400006
        });

        await guild.addJoinLeaveMessage('leave', '%USER% left the mocha test');
        let assert_array = ModelGuild.DEFAULTS.LEAVE_MESSAGES.concat(['%USER% left the mocha test']);

        assert.deepEqual(guild.settings.leave_messages, assert_array);
    });

    it('removeJoinLeaveMessage to throw an error if the action is neither join nor leave', async () => {
        let guild = await ModelGuild.create({
            name: 'removeJoinLeaveMessage to throw an error if the action is neither join nor leave',
            discord_id: 2400007
        });

        assert.isRejected(guild.removeJoinLeaveMessage(undefined, 'Some message'), 'The action have to be either join or leave');
        assert.isRejected(guild.removeJoinLeaveMessage(null, 'Some message'), 'The action have to be either join or leave');
        assert.isRejected(guild.removeJoinLeaveMessage(1, 'Some message'), 'The action have to be either join or leave');
        assert.isRejected(guild.removeJoinLeaveMessage(-1, 'Some message'), 'The action have to be either join or leave');
        assert.isRejected(guild.removeJoinLeaveMessage('some string', 'Some message'), 'The action have to be either join or leave');
        assert.isRejected(guild.removeJoinLeaveMessage({}, 'Some message'), 'The action have to be either join or leave');
    });

    it('removeJoinLeaveMessage pull messages to the join array', async () => {
        let guild = await ModelGuild.create({
            name: 'removeJoinLeaveMessage pull messages to the join array',
            discord_id: 2400008
        });

        let assert_array = ModelGuild.DEFAULTS.JOIN_MESSAGES;
        let message = assert_array.pop();
        await guild.removeJoinLeaveMessage('join', message);

        assert.deepEqual(guild.settings.join_messages, assert_array);
    });

    it('removeJoinLeaveMessage pull messages to the leave array', async () => {
        let guild = await ModelGuild.create({
            name: 'addJoinLeaveMessage pull messages to the leave array',
            discord_id: 2400009
        });

        let assert_array = ModelGuild.DEFAULTS.LEAVE_MESSAGES;
        let message = assert_array.pop();
        await guild.removeJoinLeaveMessage('leave', message);

        assert.deepEqual(guild.settings.leave_messages, assert_array);
    });

    it('setRole should set roles', async () => {
        let guild = await ModelGuild.create({
            name: 'setRole should set roles',
            discord_id: 2400010
        });

        let cooldown_role_id = 250000;
        let timeout_role_id = 250001;
        let muted_role_id = 250002;

        await guild.setRole(ModelGuild.ROLES.COOLDOWN, cooldown_role_id);
        await guild.setRole(ModelGuild.ROLES.TIMEOUT, timeout_role_id);
        await guild.setRole(ModelGuild.ROLES.MUTED, muted_role_id);

        assert.strictEqual(guild.roles[ModelGuild.ROLES.COOLDOWN], cooldown_role_id);
        assert.strictEqual(guild.roles[ModelGuild.ROLES.TIMEOUT], timeout_role_id);
        assert.strictEqual(guild.roles[ModelGuild.ROLES.MUTED], muted_role_id);
    });

    it('setChannel should set channels', async () => {
        let guild = await ModelGuild.create({
            name: 'ssetChannel should set channels',
            discord_id: 2400011
        });

        let join_leave_channel_id = 250000;
        let transparency_channel_id = 250001;

        await guild.setChannel(ModelGuild.CHANNELS.JOIN_LEAVE, join_leave_channel_id);
        await guild.setChannel(ModelGuild.CHANNELS.TRANSPARENCY, transparency_channel_id);

        assert.strictEqual(guild.channels[ModelGuild.CHANNELS.JOIN_LEAVE], join_leave_channel_id);
        assert.strictEqual(guild.channels[ModelGuild.CHANNELS.TRANSPARENCY], transparency_channel_id);
    });

    it('setPrefix to throw an error if the prefix is invalid', async () => {
        let guild = await ModelGuild.create({
            name: 'setPrefix to throw an error if the prefix is invalid',
            discord_id: 2400012
        });

        assert.isRejected(guild.setPrefix(0), 'Invalid Prefix');
        assert.isRejected(guild.setPrefix(''), 'Invalid Prefix');
        assert.isRejected(guild.setPrefix('1234567890123456'), 'Invalid Prefix');
        assert.isRejected(guild.setPrefix(null), 'Invalid Prefix');
        assert.isRejected(guild.setPrefix({}), 'Invalid Prefix');
    });

    it('setPrefix to default to the default prefix', async () => {
        let guild = await ModelGuild.create({
            name: 'setPrefix to default to the default prefix',
            discord_id: 2400013,
            cmd_prefix: 'cmd_prefix'
        });

        await guild.setPrefix();
        assert.strictEqual(guild.cmd_prefix, ModelGuild.DEFAULTS.PREFIX);
    });

    it('setPrefix to set the prefix', async () => {
        let guild = await ModelGuild.create({
            name: 'setPrefix to set the prefix',
            discord_id: 2400014,
            cmd_prefix: 'cmd_prefix'
        });

        await guild.setPrefix('set_prefix');
        assert.strictEqual(guild.cmd_prefix, 'set_prefix');
    });

    it('enableLevelling should enable levelling', async () => {
        let guild = await ModelGuild.create({
            name: 'enableLevelling should enable levelling',
            discord_id: 2400015,
            settings: {
                levelling_enabled: false
            }
        });

        assert.strictEqual(guild.settings.levelling_enabled, false);
        await guild.enableLevelling();
        assert.strictEqual(guild.settings.levelling_enabled, true);
    });

    it('disableLevelling should disable levelling', async () => {
        let guild = await ModelGuild.create({
            name: 'disableLevelling should disable levelling',
            discord_id: 2400016
        });

        assert.strictEqual(guild.settings.levelling_enabled, true);
        await guild.disableLevelling();
        assert.strictEqual(guild.settings.levelling_enabled, false);
    });

    it('setLevelling should set levelling', async () => {
        let guild = await ModelGuild.create({
            name: 'setLevelling should set levelling',
            discord_id: 2400017
        });

        assert.strictEqual(guild.settings.levelling_enabled, true);
        await guild.setLevelling(false);
        assert.strictEqual(guild.settings.levelling_enabled, false);
        await guild.setLevelling(true);
        assert.strictEqual(guild.settings.levelling_enabled, true);
    });

    it('setSetting should set your setting', async () => {
        let guild = await ModelGuild.create({
            name: 'setSetting should set your setting',
            discord_id: 2400018
        });

        await guild.setSetting('mocha_test', true);
        assert.strictEqual(guild.settings.mocha_test, true);
    });

    it('findByDiscordID should get by discord_id', async () => {
        let guild = await ModelGuild.create({
            name: 'findByDiscordID should get by discord_id',
            discord_id: 2400019
        });

        let found_guild = await ModelGuild.findByDiscordID(2400019);
        assert.strictEqual(found_guild.id, guild.id);
    });

    after((done) => {
        mongoose.connection.db.dropDatabase(() => {
            mongoose.disconnect();

            done();
        });
    });
});