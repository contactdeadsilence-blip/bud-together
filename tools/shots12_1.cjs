module.exports=async({ev,frames,press,shot,click,sl})=>{
 await ev(()=>__bt.openPhone());await frames(3);await shot('phone-home');
 await click('#phone [data-ph=app]');await frames(3);await shot('phone-shop');
 await click('#phone [data-v=seeds]');await click('#phone [data-ph=add]');await click('#phone [data-ph=add]');await click('#phone [data-v=all]');await click('#phone [data-v=soil]');await shot('phone-category');
 await click('#phone [data-ph=search]');for(const k of 'NUT')await click(`#phone [data-pk=k${k}]`);await shot('phone-search');await click('#phone [data-pk=kOK]');await shot('phone-search-results');
 await click('#phone [data-v=cart]');await shot('phone-cart');await click('#phone [data-ph=checkout]');await sl(800);await shot('phone-tracking');await sl(6000);await shot('phone-delivered');}
