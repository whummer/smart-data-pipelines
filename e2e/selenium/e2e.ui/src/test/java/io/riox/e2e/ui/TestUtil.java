package io.riox.e2e.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import static io.riox.e2e.ui.Constants.*;


/**
 * Various test utility methods, e.g., navigating to a specific
 * page, log in as a particular user, etc.
 *
 * @author Waldemar Hummer
 * @author riox
 */
public class TestUtil {

	/**
	 * Navigate to the "Settings" page.
	 */
	public static void navToSettings(WebDriver driver) {
		WebElement settingsLink = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.linkText("Settings")));
		settingsLink.click();
		sleep(500);
	}

	/**
	 * Navigate to the "Organization Settings" page.
	 */
	public static void navToOrgsSettings(WebDriver driver) {
		navToSettings(driver);

		WebElement orgsSettingsLink = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.xpath(
					"//*[@ui-sref=\"index.settings.organizations\"]")));
		orgsSettingsLink.click();

		sleep(500);
	}

	/**
	 * Log in with a given user account.
	 */
	public static void login(WebDriver driver, String email, String password) {
		WebElement loginField = new WebDriverWait(driver, TIMEOUT_LONG)
			.until(ExpectedConditions.presenceOfElementLocated(By.xpath(
					"//*[@ui-sref=\"index.login\"]")));
		loginField.click();

		WebElement emailField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.name("email")));
		emailField.sendKeys(email);

		WebElement passwordField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.name("password")));
		passwordField.sendKeys(Constants.TEST_USER1_PASS);

		WebElement loginBox = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.name("form1")));
		loginBox.submit();
	}

	/**
	 * Log out the currently active user.
	 */
	public static void logout(WebDriver driver) {
		WebElement loginField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.partialLinkText("Logout")));
		loginField.click();
		sleep(2000);
	}

	private static void sleep(long millis) {
		try {
			Thread.sleep(1000);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

}
