/* eslint-disable */
class MetaTag {
  static setTitle(title: string) {
    // document.title = title;
    this.setMeta('og:title', title)
    this.setMeta('twitter:title', title)
    this.setMeta('og:site_name', title)
  }
  static setDescription(description: string) {
    this.setMeta('description', description)
    this.setMeta('og:description', description)
    this.setMeta('twitter:description', description)
  }
  static setUrl(url: string) {
    this.setMeta('og:url', url)
    this.setMeta('twitter:site', url)
  }
  static setImage(img: string) {
    this.setMeta('og:image', img)
    this.setMeta('twitter:image', img)
  }
  static setCard() {
    this.setMeta('twitter:card', 'summary')
    this.setMeta('og:type', 'website')
  }

  //createMeta is create meta
  static createMeta(name: string, content: string) {
    let _m = document.createElement('meta')
    if (name.startsWith('og:')) {
      _m.setAttribute('property', name)
    } else {
      _m.setAttribute('name', name)
    }
    _m.setAttribute('content', content)
    document.head.appendChild(_m)
  }

  //setMeta is change meta tag
  //eg. name = description, og:type, twitter:card
  static setMeta(name: string, content: string, isCreate = true) {
    const metas = document.head.getElementsByTagName('meta')
    let isRewrited = false
    for (let i = 0; i < metas.length; i++) {
      let _name = null
      if (name.startsWith('og:')) {
        _name = metas[i].getAttribute('property') //ogp
      } else {
        _name = metas[i].getAttribute('name') //other
      }
      if (_name !== null && _name === name) {
        isRewrited = true
        metas[i].setAttribute('content', content)
      }
    }
    if (isCreate && !isRewrited) {
      this.createMeta(name, content)
    }

    // for (const meta of metas) {
    //   let _name = null
    //   if (name.startsWith('og:')) {
    //     _name = meta.getAttribute('property') //ogp
    //   } else {
    //     _name = meta.getAttribute('name') //other
    //   }
    //   if (_name !== null && _name === name) {
    //     isRewrited = true
    //     meta.setAttribute('content', content)
    //   }
    // }
    // if (isCreate && !isRewrited) {
    //   this.createMeta(name, content)
    // }
  }
}

export default MetaTag
/* eslint-enable */
