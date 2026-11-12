(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var marketCode = script.getAttribute("data-market");
  if (!marketCode) return;
  var endpoint = "/data/pharmacy-inventory.json";
  var maxAgeHours = 24;
  var section = document.createElement("section");
  section.className = "section pharmacy-inventory";
  section.setAttribute("aria-labelledby", "pharmacy-inventory-title");
  var container = document.createElement("div");
  container.className = "container article";
  section.appendChild(container);
  function node(tag, text, cls) {
    var el = document.createElement(tag);
    if (text !== undefined && text !== null) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  }
  function renderUnavailable(message) {
    container.replaceChildren();
    container.appendChild(node("span", "خدمات صيدليات الهيثم", "eyebrow"));
    container.appendChild(node("h2", "السعر والتوفر في " + (window.SEHA_MARKET_NAME || "هذه الدولة"), ""));
    container.appendChild(node("p", message));
    var note = node("p", "لا نعرض سعرًا أو حالة مخزون غير مؤكدة. يتم تحديث بيانات العرض عند وصول سجل فعلي موثق ومسموح بنشره.", "small");
    container.appendChild(note);
  }
  fetch(endpoint, {cache:"no-store"})
    .then(function (response) { if (!response.ok) throw new Error("feed unavailable"); return response.json(); })
    .then(function (feed) {
      var market = feed && feed.markets && feed.markets[marketCode];
      if (!market) throw new Error("market missing");
      window.SEHA_MARKET_NAME = market.country;
      container.appendChild(node("span", "صيدليات الهيثم · " + market.country, "eyebrow"));
      container.appendChild(node("h2", "السعر والتوفر حسب بيانات الصيدلية", ""));
      container.appendChild(node("p", "تُعرض المعلومات التالية فقط عند توافر بيانات حديثة والتحقق من السماح بنشرها في السوق المحلي."));
      var products = Array.isArray(market.products) ? market.products : [];
      var visible = products.filter(function (p) {
        if (!p || p.public_listing_approved !== true || p.registration_verified !== true) return false;
        if (!p.updated_at || !p.product_name || !p.availability) return false;
        var stamp = Date.parse(p.updated_at);
        if (!Number.isFinite(stamp) || Date.now() - stamp > maxAgeHours * 3600000 || stamp > Date.now() + 300000) return false;
        return true;
      });
      if (!visible.length) {
        container.appendChild(node("p", "لا توجد حاليًا بيانات سعر ومخزون منشورة ومحدّثة لهذه الدولة. للاستفسار، تواصلي مع صيدليات الهيثم للتحقق من المنتج والفرع وشروط الصرف.", "notice"));
        var link = node("a", "التواصل مع صيدليات الهيثم");
        link.href = "/services/";
        link.className = "btn primary";
        container.appendChild(link);
      } else {
        visible.forEach(function (p) {
          var card = node("article", null, "topic-card");
          card.appendChild(node("h3", p.product_name + (p.strength ? " · " + p.strength : "")));
          var status = p.availability === "in_stock" ? "متوفر وفق آخر تحديث" :
            p.availability === "out_of_stock" ? "غير متوفر وفق آخر تحديث" : "يرجى تأكيد التوفر مع الفرع";
          card.appendChild(node("p", status));
          if (p.branch_name) card.appendChild(node("p", "الفرع: " + p.branch_name));
          card.appendChild(node("p", "آخر تحديث: " + new Date(p.updated_at).toLocaleString(market.locale, {timeZone:market.timezone})));
          if (p.prescription_note) card.appendChild(node("p", p.prescription_note, "small"));
          var wa = node("a", "للاستفسار عن السعر والتوفر عبر واتساب");
          wa.href = "https://wa.me/966538159747";
          wa.target = "_blank";
          wa.rel = "noopener noreferrer";
          wa.className = "btn primary";
          card.appendChild(wa);
          container.appendChild(card);
        });
      }
      container.appendChild(node("p", "تُخفى تلقائيًا البيانات التي تجاوزت 24 ساعة أو التي لا تحمل اعتمادًا للنشر العام والتحقق من التسجيل المحلي.", "small"));
    })
    .catch(function () {
      renderUnavailable("تعذر تحميل بيانات الصيدلية حاليًا. لا يعني ذلك أن المنتج غير متوفر؛ يرجى التواصل مع الصيدلية للتحقق المباشر.");
    });
  var main = document.querySelector("main");
  if (main) main.insertAdjacentElement("afterend", section);
})();