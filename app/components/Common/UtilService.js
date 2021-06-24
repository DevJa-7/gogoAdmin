import React from 'react';
import * as CONST from "./constants"
import Config from "./Config"

class UtilService {
    static getDateTime(timestamp) {
        return moment.unix(timestamp).format("YYYY-MM-DD hh:mm a");
    }

    static getDate(timestamp) {
        return moment.unix(timestamp).format("YYYY-MM-DD");
    }

    static getLongTime(timestamp) {
        return moment.unix(timestamp).format("HH:mm:ss");
    }

    static getShortTime(timestamp) {
        return moment.unix(timestamp).format("HH:mm");
    }

    static getShortTime1(timestamp) {
        return moment.unix(timestamp).format("h:mm A");
    }

    static getDateTimeByFormat(timestamp, format) {
        if (timestamp == undefined) {
            return
        }
        return moment.unix(timestamp).format(format);
    }

    static getDateJoined(dateTimeStr) {
        return moment.unix(new Date(dateTimeStr).getTime() / 1000).format("MMM YYYY");
    }

    static initLanguage() {
        $("[data-localize]").localize('server/i18n/site', { language: this.getLanguage() });
    }

    static getLangData(data) {
        if (data == null) return "";
        var lang = this.getLanguage();
        if (lang == 'en')
            return data.english;
        else
            return data.chinese;
    }

    static getTimeExceptSecond(dateTimeStr) {
        return moment.unix(new Date(dateTimeStr).getTime() / 1000).format("HH:mm");
    }

    static getLangSelectData(data, value, condition) {
        if (condition != null) {
            if (condition.specialcondition == 1 && condition.value == 0) { //if value is 0, then show original, else show *****
                return condition.run
            }
            if (condition.specialcondition == 2 && condition.value != 0) { //if value is 0, then show *****, else show original
                return condition.run
            }
        }

        if (data == null) return "";
        var lang = this.getLanguage();
        if (lang == 'en')
            return data.english[Math.floor(value)];
        else
            return data.chinese[Math.floor(value)];
    }

    static getTextAlign(val) {
        if (!val) return "left";

        if (val == 1)
            return "center";
        else if (val == 2)
            return "right";
        else if (val == 0)
            return "left";

        return val;
    }

    static getTrimText(val, len) {
        if (val.length < len) return val

        return val.substr(0, len) + "..."
    }

    static getImageFromPath(path) {
        if (path == null || path == undefined || path == "") {
            return './img/placeholder.svg'
        } else {
            return Config.FILE_SERVER_URL + '/' + path
        }
    }

    static getUserAvatar(obj) {
        if (obj) {
            if (obj.avatar != null && obj.avatar != undefined && obj.avatar != "") {
                return Config.FILE_SERVER_URL + '/' + obj.avatar
            }
        }
        return './img/placeholder.svg'
    }

    static getProfileFromPath(path) {
        if (path == null || path == undefined || path == "") {
            return './img/profile-pic.svg'
        } else {
            if (path.includes("https://")) {
                return path
            } else {
                return Config.FILE_SERVER_URL + '/' + path
            }
        }
    }

    static getOrderStatus(status) {
        switch (status) {
            case "OrderRequest":
                return <div className="badge p-sm bg-warning">{status}</div>
            case "OrderAccepted":
                return <div className="badge p-sm bg-primary">{status}</div>
            case "OrderDeclined":
                return <div className="badge p-sm bg-danger">{status}</div>
            case "OrderPrepared":
                return <div className="badge p-sm bg-primary">{status}</div>
            case "OrderCancelled":
                return <div className="badge p-sm bg-danger">{status}</div>
            case "OrderReady":
                return <div className="badge p-sm bg-success">{status}</div>
            case "OrderCompleted":
                return <div className="badge p-sm bg-success">{status}</div>
        }
    }

    static getTripStatus(status) {
        switch (status) {
            case "TripRequest":
                return <div className="badge p-sm bg-warning">{status}</div>
            case "TripAccepted":
                return <div className="badge p-sm bg-purple">{status}</div>
            case "TripDeclined":
                return <div className="badge p-sm bg-danger">{status}</div>
            case "TripCancelled":
                return <div className="badge p-sm bg-danger">{status}</div>
            case "TripConfirmed":
                return <div className="badge p-sm bg-primary">{status}</div>
            case "TripStarted":
                return <div className="badge p-sm bg-primary">{status}</div>
            case "TripArrived":
                return <div className="badge p-sm bg-pink">{status}</div>
            case "TripDropped":
                return <div className="badge p-sm bg-pink">{status}</div>
            case "TripCompleted":
                return <div className="badge p-sm bg-success">{status}</div>
        }
    }

    static getCardBrand(card) {
        switch (card) {
            case "cash":
                return <img src={'./img/card/cc_cash.png'} className="thumb24 img-fit" />
        }
    }

    static changeSwitchValue(obj) {
        if (obj.prop('checked') == true) {
            obj.prop('checked', false);
            return false;
        } else {
            obj.prop('checked', true);
            return true;
        }
    }

    static getPhoneNumber(phone_code, phone_number) {
        if (phone_code) {
            return "+" + phone_code + ' ' + phone_number
        }
        return phone_number
    }

    static getFullname(obj) {
        if (obj) {
            if ((obj.firstname != undefined && obj.firstname.length != 0) || (obj.lastname != undefined && obj.lastname.length != 0)) {
                return obj.firstname + " " + obj.lastname
            }
            return obj.email
        }
        return ""
    }
}

export default UtilService;