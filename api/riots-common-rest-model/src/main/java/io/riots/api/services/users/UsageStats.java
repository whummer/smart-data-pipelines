package io.riots.api.services.users;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Class to capture usage statistics.
 * @author whummer
 */
public class UsageStats {

	public static enum UsagePeriod {
		hour, day, week, month, year
	}

	public static class Usage {
		Date fromDate;
		Date toDate;
		long apiCalls;
		long updateEvents;
		double dataTraffic;
		
		public Date getFromDate() {
			return fromDate;
		}
		public void setFromDate(Date fromDate) {
			this.fromDate = fromDate;
		}
		public Date getToDate() {
			return toDate;
		}
		public void setToDate(Date toDate) {
			this.toDate = toDate;
		}
		public long getApiCalls() {
			return apiCalls;
		}
		public void setApiCalls(long apiCalls) {
			this.apiCalls = apiCalls;
		}
		public double getDataTraffic() {
			return dataTraffic;
		}
		public void setDataTraffic(double dataTraffic) {
			this.dataTraffic = dataTraffic;
		}
		public long getUpdateEvents() {
			return updateEvents;
		}
		public void setUpdateEvents(long updateEvents) {
			this.updateEvents = updateEvents;
		}
	}

	@JsonProperty
	String userId;
	@JsonProperty
	List<Usage> usage = new LinkedList<>();

	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public List<Usage> getUsage() {
		return usage;
	}

}
