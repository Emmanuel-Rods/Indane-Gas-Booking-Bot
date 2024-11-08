const puppeteerExtra = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
require("dotenv").config();

puppeteerExtra.use(Stealth());

let username = process.env.USER_NAME;
let password = process.env.PASSWORD;

async function book() {
  if (username == "" || password == "") {
    throw new Error("Username/Password cannot be Empty");
  }

  if(Number(username)){
    if(username.length !== 10){
      throw new Error("Please Input a Valid Phone Number")
    }
  }
  
  if(String(username)){
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(username))
     throw new Error("Please Input a Valid Email")
  }

  console.time("Timer");
  function delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  const browserObj = await puppeteerExtra.launch({ headless: true });
  const page = await browserObj.newPage();

  await page.setViewport({ width: 1920, height: 1080 });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  await page.goto(
    "https://cx.indianoil.in/webcenter/portal/LPG/pages_bookrefillpol"
  );
  await page.waitForNetworkIdle(); // Wait for network resources to fully load

  //usersname
  await page.locator("input").fill(username);
  await page.locator("input[type='submit']").click();
  await page.screenshot({ path: "login_screenshot.png" });
  console.log(`Username Filled`);
  //password
  await page.waitForNetworkIdle();
  await page.locator('input[type="password"]').fill(password);

  await page.locator("iframe").click(); //captcha

  await delay(2000);

  await page.screenshot({ path: "captcha_bypass_screenshot.png" });
  await page.locator("input[type='submit']").click();
  console.log(`Password Filled`);
  delay(2000);
  await page.waitForNetworkIdle();

  //selecting
  const options = await page.$("[title='Please Select']");
  await options.select("0");
  await page.screenshot({ path: "selection_screenshot.png" });
  console.log(`Option Selected`);
  //booking
  await page.locator("div ::-p-text(BOOK NOW)").click();

  console.log(`Booked`);
  await page.waitForNetworkIdle();

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  await page.screenshot({ path: "receipt_screenshot.png" });
  console.log("Process Finished");
  console.timeEnd("Timer");
  await browserObj.close();
}

book();
