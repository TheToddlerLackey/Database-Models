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
const Schema = mongoose.Schema;
const Model = mongoose.Model;

const DEFAULT_PREFIX = '$l.';
const DEFAULT_JOIN_MESSAGES = ['%USER_MENTION% have joined!'];
const DEFAULT_LEAVE_MESSAGES = ['%USER% have left!', 'After time adrift among open stars. Along tides of light and through shoals of dust. %USER% returned to where they began.'];
const DEFAULT_LEVELLING_ENABLED = true;

const VALIDATE_PREFIX = (prefix) => {
    return typeof prefix === 'string' && prefix.length <= 10 && prefix.length >= 1;
};
const VALIDATE_NAME = (name) => {
    return typeof name === 'string' && name.length <= 100 && name.length >= 2;
};

const ROLES = {
    MUTED: 'muted',
    COOLDOWN: 'cooldown',
    TIMEOUT: 'timeout'
};
const CHANNELS = {
    TRANSPARENCY: 'transparency',
    JOIN_LEAVE: 'join_leave'
};

const GuildSchema = new Schema({
    discord_id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true,
        validate: VALIDATE_NAME
    },
    cmd_prefix: {
        type: String,
        validate: VALIDATE_PREFIX,
        required: true,
        default: DEFAULT_PREFIX
    },
    channels: {
        transparency: Number,
        join_leave: Number
    },
    roles: {
        muted: Number,
        cooldown: Number,
        timeout: Number
    },
    settings: {
        join_messages: {
            type: Array,
            default: DEFAULT_JOIN_MESSAGES
        },
        leave_messages: {
            type: Array,
            default: DEFAULT_LEAVE_MESSAGES
        },
        levelling_enabled: {
            type: Boolean,
            required: true,
            default: DEFAULT_LEVELLING_ENABLED
        }
    }
});

class Guild extends Model {

    async setName(name) {
        if (!VALIDATE_NAME(name)) {
            throw new Error('Invalid name');
        }

        this.name = name;

        return await this.save();
    }

    async addJoinLeaveMessage(action, message) {
        if (action !== 'join' && action !== 'leave') {
            throw new Error('The action have to be either join or leave');
        }

        let array = action === 'leave' ? this.settings.leave_messages : this.settings.join_messages;

        array.push(message);

        return await this.save();
    }

    async removeJoinLeaveMessage(action, message) {
        if (action !== 'join' && action !== 'leave') {
            throw new Error('The action have to be either join or leave');
        }

        let array = action === 'leave' ? this.settings.leave_messages : this.settings.join_messages;

        array.pull(message);

        return await this.save();
    }

    async setRole(role, role_id) {
        this.roles[role] = role_id;

        return await this.save();
    }

    async setChannel(channel, channel_id) {
        this.channels[channel] = channel_id;

        return await this.save();
    }

    /**
     *
     * Sets the command prefix for the guild. If the prefix parameter is omitted the default
     * command prefix will be utilised
     *
     * @param prefix the command prefix to use
     * @returns {Promise<*>}
     */
    async setPrefix(prefix = DEFAULT_PREFIX) {
        if (!VALIDATE_PREFIX(prefix)) {
            throw new Error('Invalid Prefix');
        }

        this.cmd_prefix = prefix;

        return await this.save();
    }

    /**
     *
     * Enables server wide levelling for users
     *
     * @returns {Promise<*>}
     */
    async enableLevelling() {
        return await this.setLevelling(true);
    }

    /**
     *
     * Disabled server wide levelling for users
     *
     * @returns {Promise<*>}
     */
    async disableLevelling() {
        return await this.setLevelling(false);
    }

    /**
     *
     * Wether or not to enable or disable levelling for users
     *
     * @param levelling true to enable, false to disable
     * @returns {Promise<*>}
     */
    async setLevelling(levelling) {
        if (levelling !== true && levelling !== false) {
            throw new Error('Levelling has to be a boolean');
        }

        return await this.setSetting('levelling_enabled', levelling);
    }

    async setSetting(setting, value) {
        this.settings[setting] = value;

        return await this.save();
    }

    static async findByDiscordID(discord_id) {
        return await ModelGuild.findOne({
            discord_id: discord_id
        });
    }
}

GuildSchema.loadClass(Guild);
const ModelGuild = mongoose.model('Guild', GuildSchema);

module.exports = ModelGuild;
module.exports.ROLES = ROLES;
module.exports.CHANNELS = CHANNELS;
module.exports.DEFAULTS = {
    PREFIX: DEFAULT_PREFIX,
    LEAVE_MESSAGES: DEFAULT_LEAVE_MESSAGES,
    JOIN_MESSAGES: DEFAULT_JOIN_MESSAGES,
    LEVELLING_ENABLED: DEFAULT_LEVELLING_ENABLED
};