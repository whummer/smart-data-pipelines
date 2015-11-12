package io.riox.e2e.ui;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Tests the functionality to invite a user to an organization.
 * 
 * @author Waldemar Hummer
 */
public class OrganizationInviteTest extends AbstractProxyTest {


	@Test
	public void testInvite() throws InterruptedException {

		driver.get(rioxUrl);

		/* LOGIN AS USER1 */

		TestUtil.login(driver, Constants.TEST_USER1_EMAIL, Constants.TEST_USER1_PASS);

		/* USER1 INVITES USER2 */

		TestUtil.navToOrgsSettings(driver);

		WebElement orgLink = new WebDriverWait(driver, 10)
				  .until(ExpectedConditions.presenceOfElementLocated(By.linkText("Default Organization")));
		orgLink.click();

		WebElement newMemberField = new WebDriverWait(driver, 10)
		  .until(ExpectedConditions.presenceOfElementLocated(By.id("inputNewMem_value")));
		newMemberField.sendKeys(Constants.TEST_USER2_EMAIL);

		/* NOTE: We need to make sure that the focus is off the input field, 
		 * due to angucomplete which shows a dropdown that hides the submit button
		 * and makes it non-clickable with selenium. Hence, simply click on a label
		 * somewhere on the page. */
		WebElement labelAddMember = new WebDriverWait(driver, 5)
		  .until(ExpectedConditions.presenceOfElementLocated(By.xpath("//label[@for='inputNewMem']")));
		labelAddMember.click();
		Thread.sleep(1000*1);

		WebElement btnAddMember = new WebDriverWait(driver, 5)
		  .until(ExpectedConditions.presenceOfElementLocated(By.id("btnAddMember")));
		btnAddMember.click();
		/* we need to wait here until the growl message is gone :/ */
		Thread.sleep(Constants.GROWL_MESSAGE_SLEEP_TIMEOUT);

		TestUtil.logout(driver);

		/* LOGIN AS USER2 */

		TestUtil.login(driver, Constants.TEST_USER2_EMAIL, Constants.TEST_USER2_PASS);

		/* USER2 ACCEPTS INVITATION */

		TestUtil.navToOrgsSettings(driver);
		Thread.sleep(2000);

		WebElement linkAccept = new WebDriverWait(driver, 10)
			.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//tr[td/text()='PENDING']//a[@title='Accept Invitation']")));
		linkAccept.click();

		Thread.sleep(2000);

		try {
			new WebDriverWait(driver, 1)
				.until(ExpectedConditions.presenceOfElementLocated(By.xpath(
					"//tr[td/text()='PENDING']//a[@title='Accept Invitation']")));
			throw new RuntimeException("Accept link should not exist");
		} catch (TimeoutException e) {
			/* expected exception, swallow */
		}

		/* TEST FINISHED */
		driver.quit();
	}

}
