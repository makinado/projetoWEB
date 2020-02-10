module.exports = app => {

    function existsOrError(value, msg) {
        if (!value) throw msg
        if (Array.isArray(value) && value.length === 0) throw msg
        if (typeof value === 'string' && !value.trim()) throw msg
    }

    function notExistsOrError(value, msg) {
        try {
            existsOrError(value, msg)
        } catch (msg) {
            return
        }
        throw msg
    }

    function equalsOrError(valueA, valueB, msg) {
        if (valueA !== valueB) throw msg
    }

    function parseNumber(price, decimalpoint = ",") {
        let p = price.split(decimalpoint);
        for (let i = 0; i < p.length; i++) p[i] = p[i].replace(/\D/g, '');
        return parseFloat(p.join('.'));
    }

    function moneyToNumber(price) {
        return price.replace('R$', "");
    }

    function percentToNumber(price) {
        return price.replace('%', "");
    }

    function formatDate(date) {
        if (!date) return null;

        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    }

    return { existsOrError, notExistsOrError, equalsOrError, parseNumber, moneyToNumber, percentToNumber, formatDate }
}