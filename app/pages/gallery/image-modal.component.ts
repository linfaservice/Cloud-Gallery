import { Page } from "ui/page";
import { Component, OnInit } from "@angular/core";
import { Util } from "../../common/util";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import Loader from "../../common/loader";
import * as Toast from 'nativescript-toast';
import * as Http from "tns-core-modules/http";
import * as SocialShare from 'nativescript-social-share';
import { ImageSource } from "image-source";
import * as Platform from "platform";
import { TranslateService } from "ng2-translate";
import * as Settings from "application-settings";
import * as  Base64 from "base-64";
import { TNSFontIconService } from 'nativescript-ngx-fonticon';

 
 
@Component({
  selector: "imagemodal",
  templateUrl: "pages/gallery/image-modal.html",
  styleUrls: ["pages/gallery/image-modal.css"],
  providers: []
})


export class ImageModalComponent {

  private language;
  private host;
  private username;
  private password;
  private rootdir;
  private headers;  

  private item; 
  private loader;

  public constructor(
    private params: ModalDialogParams, 
    private page: Page,
    private translate: TranslateService,
    private fonticon: TNSFontIconService,
    private util: Util
  )  {

    this.language = Platform.device.language;
    this.translate.setDefaultLang("en");
    this.translate.use(Platform.device.language.split("-")[0]);
 
    this.host = Settings.getString("host");
    this.username = Settings.getString("username");
    this.password = Settings.getString("password");
    this.rootdir = Settings.getString("rootdir");  
    this.rootdir = (this.rootdir==null)? "":this.rootdir;
    this.headers = { 
      "OCS-APIREQUEST": "true",
      "Authorization": "Basic "+Base64.encode(this.username+':'+this.password)
    } 

    this.item = params.context.item;
    this.loader = params.context.loader;
   
  }
 
  ngOnInit() {    
  }    

  ngAfterViewInit() {  
    this.loader.hideLoader();

    // load high resolution image in background
    //console.log("Image Loading: " + this.item.url + "/500/500");

    if(!this.item.loaded) {
      Http.request({
          url: this.item.url + "/500/500",
          method: "GET",
          headers: this.headers
      }).then((response:any)=> {

          response.content.toImage()
            .then((image)=> {
              let base64 = image.toBase64String("jpg");
              let highsrc = base64;
              this.item.src = highsrc;
              this.item.loaded = true;
            })
            .catch((error)=> {
              //util.log("error", error);
            });  

      }, (e)=> {
          //Toast.makeText("There was a problem loading the higher resolution version of the image").show();
      });       
    }
  }

  public close() {
      this.params.closeCallback({
        "close": true
      }); 
  }

  public onTouchEffect(e) {
      if(e.type="tap" && e.action=="down") { 
          e.view.style.opacity = "0.5"; 
      } 
      if(e.type="tap" && e.action=="up") { 
          e.view.style.opacity = "1"; 
      }       
  }  

  onTap(item) {
    let image = new ImageSource();
    image.loadFromBase64(item.src);

    SocialShare.shareImage(image, this.translate.instant("Share") + " " + item.title);  
  }
 
}
