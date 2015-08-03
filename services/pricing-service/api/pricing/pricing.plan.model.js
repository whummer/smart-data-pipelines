'use strict';

var mongoose = global.mongoose || require('mongoose');
var Schema = mongoose.Schema;

var template = {
	"_id": { type: String, unique: true, default: genShortUUID}
};

/**
 * Name of this pricing plan.
 */
template[NAME] = String;
/**
 * ID of the organization this pricing plan applies to.
 */
template[ORGANIZATION_ID] = String;
/**
 * Individual pricing items which define this pricing plan.
 */
var pricingItem = {};
template[PRICING_ITEMS] = [ pricingItem ];
pricingItem["_id"] = false;
pricingItem[TYPE] = { type: String, enum: [TYPE_FIXED_PRICE, TYPE_VARIABLE_PRICE] };
pricingItem[PERIOD] = { type: String, enum: [TIMEUNIT_MONTH, TIMEUNIT_DAY] };
pricingItem[AMOUNT] = Number;
/**
 * Usage limits associated with this pricing plan.
 */
var limit = {};
template[LIMITS] = [ limit ];
limit["_id"] = false;
limit[TYPE] = { type: String, enum: [LIMIT_API_KEYS, LIMIT_DATA_MESSAGES] };
limit[AMOUNT] = Number;
/**
 * Creation date.
 */
template[CREATION_DATE] = Date;
/**
 * Creating user.
 */
template[CREATOR_ID] = String;


var PricingPlanSchema = new Schema(template);
PricingPlanSchema.set('toJSON', { virtuals: true });
PricingPlanSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PricingPlan', PricingPlanSchema);
