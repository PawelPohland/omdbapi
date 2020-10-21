class Storage {

  static read() {
    const data = localStorage.getItem("mlib");
    if (data) {
      return JSON.parse(data);
    }

    return null;
  } // read

  static save(data) {
    try {
      if (data && data.length) {
        localStorage.setItem("mlib", JSON.stringify(data));
      } else {
        localStorage.removeItem("mlib");
      }
    } catch (err) {
      console.error(err);
    }
  } // save

} // Storage