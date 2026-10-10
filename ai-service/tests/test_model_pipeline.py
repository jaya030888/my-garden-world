import io
import pytest
import numpy as np
from PIL import Image
from app.botanical_db import lookup_botanical_info, VERIFIED_BOTANICAL_TAXONOMY, INANIMATE_CONTAINER_CLASSES

def test_botanical_taxonomy_species_lookup():
    """Verify that botanical lookups return strictly verified scientific taxonomy."""
    # Direct match
    info, is_verified, det_type, expl = lookup_botanical_info("daisy")
    assert is_verified is True
    assert det_type == "species"
    assert info["scientific_name"] == "Bellis perennis"
    assert info["family"] == "Asteraceae (Composite Family)"
    assert info["pet_safe"] is True

    # Sunflower
    info, is_verified, det_type, _ = lookup_botanical_info("sunflower")
    assert is_verified is True
    assert info["scientific_name"] == "Helianthus annuus"

    # Marigold
    info, is_verified, det_type, _ = lookup_botanical_info("marigold")
    assert is_verified is True
    assert info["scientific_name"] == "Tagetes patula"

def test_container_object_separation():
    """Verify that pots and containers are strictly isolated from botanical taxa."""
    for container_label in ["pot, flowerpot", "flowerpot", "pot", "vase", "greenhouse"]:
        info, is_verified, det_type, expl = lookup_botanical_info(container_label)
        assert is_verified is False
        assert det_type == "container_object"
        assert info is None
        assert "flowerpot" in expl or "container" in expl

def test_unidentified_species_handling():
    """Verify unmodeled or out-of-distribution classes are marked as unidentified."""
    info, is_verified, det_type, expl = lookup_botanical_info("random_unknown_object_xyz")
    assert is_verified is False
    assert det_type == "unidentified"
    assert info is None
    assert "does not match a verified species" in expl

def test_image_validation_safeguards():
    """Verify PIL image validation catches corrupt or truncated inputs."""
    from training.data_prep import validate_image_file, calculate_image_hash
    import tempfile
    from pathlib import Path

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        
        # Valid image
        valid_img_path = tmp_path / "valid.jpg"
        img = Image.new("RGB", (100, 100), color=(10, 100, 50))
        img.save(valid_img_path, format="JPEG")
        is_val, err = validate_image_file(valid_img_path)
        assert is_val is True
        assert err is None

        # Invalid corrupt file
        corrupt_img_path = tmp_path / "corrupt.jpg"
        with open(corrupt_img_path, "wb") as f:
            f.write(b"\xFF\xD8\xFF\xE0" + b"\x00" * 10) # Corrupted header
        is_val, err = validate_image_file(corrupt_img_path)
        assert is_val is False

        # Hash computation test
        with open(valid_img_path, "rb") as f:
            h1 = calculate_image_hash(f.read())
        assert len(h1) == 32
