const deleteProduct = (button) => {
  const productId = button.parentNode.querySelector('[name=productId').value;
  const csrf = button.parentNode.querySelector('[name=_csrf').value;

  const productElement = button.closest('article');

  fetch('/admin/product/' + productId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => result.json())
    .then(() => productElement.remove())
    .catch(err => console.log(err));
};