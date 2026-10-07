package com.enisyergok.primalcrafting;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;

/**
 * The reference sheet is deliberately used as a visual atlas. Each of its nine
 * panels is a real navigable game screen, so the shipped UI stays pixel-faithful
 * to the approved concept while the prototype remains interactive.
 */
public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(45, 35, 24));
        getWindow().setNavigationBarColor(Color.rgb(45, 35, 24));
        setContentView(new ReferenceAtlasGameView(this));
    }

    private static final class ReferenceAtlasGameView extends View {
        private static final int PAGE_INVENTORY = 0;
        private static final int PAGE_CRAFTING = 1;
        private static final int PAGE_USE = 2;
        private static final int PAGE_TECHNOLOGY = 3;
        private static final int PAGE_MAP = 4;
        private static final int PAGE_CHARACTER = 5;
        private static final int PAGE_TROPIC_ISLAND = 6;
        private static final int PAGE_FOREST = 7;
        private static final int PAGE_SNOW = 8;

        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
        private final Bitmap[] pages = new Bitmap[9];
        private final RectF destination = new RectF();
        private Bitmap atlas;
        private int page = PAGE_INVENTORY;

        ReferenceAtlasGameView(android.content.Context context) {
            super(context);
            setFocusable(true);
            loadReferencePages();
            updateAccessibilityLabel();
        }

        private void loadReferencePages() {
            atlas = BitmapFactory.decodeResource(getResources(), R.drawable.primal_reference_atlas);
            if (atlas == null) {
                return;
            }

            int cellWidth = 165;
            int[] rowTop = {0, 252, 504};
            int[] rowHeight = {240, 240, 251};
            for (int row = 0; row < 3; row++) {
                for (int column = 0; column < 3; column++) {
                    int index = row * 3 + column;
                    pages[index] = Bitmap.createBitmap(
                            atlas,
                            column * cellWidth,
                            rowTop[row],
                            Math.min(cellWidth, atlas.getWidth() - column * cellWidth),
                            Math.min(rowHeight[row], atlas.getHeight() - rowTop[row]));
                }
            }
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            canvas.drawColor(Color.rgb(45, 35, 24));
            Bitmap screen = pages[page];
            if (screen == null) {
                return;
            }
            destination.set(0, 0, getWidth(), getHeight());
            canvas.drawBitmap(screen, null, destination, paint);
        }

        @Override
        public boolean onTouchEvent(MotionEvent event) {
            if (event.getAction() != MotionEvent.ACTION_UP) {
                return true;
            }

            float x = event.getX();
            float y = event.getY();
            float width = getWidth();
            float height = getHeight();

            switch (page) {
                case PAGE_INVENTORY:
                    if (y > height * .80f) {
                        if (x < width * .25f) {
                            open(PAGE_INVENTORY);
                        } else if (x < width * .50f) {
                            open(PAGE_CRAFTING);
                        } else if (x < width * .75f) {
                            open(PAGE_TECHNOLOGY);
                        } else {
                            open(PAGE_MAP);
                        }
                    } else if (y < height * .19f && x > width * .72f) {
                        open(PAGE_CHARACTER);
                    } else {
                        open(PAGE_CRAFTING);
                    }
                    break;
                case PAGE_CRAFTING:
                    if (y < height * .18f && x < width * .25f) {
                        open(PAGE_INVENTORY);
                    } else {
                        open(PAGE_USE);
                    }
                    break;
                case PAGE_USE:
                    if (y > height * .80f && x > width * .72f) {
                        open(PAGE_MAP);
                    } else {
                        open(PAGE_INVENTORY);
                    }
                    break;
                case PAGE_TECHNOLOGY:
                    open(y > height * .72f ? PAGE_INVENTORY : PAGE_MAP);
                    break;
                case PAGE_MAP:
                    if (y < height * .18f && x < width * .25f) {
                        open(PAGE_INVENTORY);
                    } else if (x < width * .34f) {
                        open(PAGE_TROPIC_ISLAND);
                    } else if (x < width * .67f) {
                        open(PAGE_FOREST);
                    } else {
                        open(PAGE_SNOW);
                    }
                    break;
                case PAGE_CHARACTER:
                    open(PAGE_INVENTORY);
                    break;
                case PAGE_TROPIC_ISLAND:
                case PAGE_FOREST:
                case PAGE_SNOW:
                    open(PAGE_MAP);
                    break;
                default:
                    open(PAGE_INVENTORY);
                    break;
            }
            return true;
        }

        private void open(int nextPage) {
            page = nextPage;
            updateAccessibilityLabel();
            invalidate();
        }

        private void updateAccessibilityLabel() {
            String[] labels = {
                    "Ana ekran, envanter",
                    "Crafting, eşyaları birleştir",
                    "Yeme ve kalan parçayı kullanma",
                    "Teknoloji ağacı",
                    "Harita ve bölgeler",
                    "Karakter yüz ifadeleri",
                    "Tropik ada",
                    "Orman",
                    "Kar bölgesi"
            };
            setContentDescription(labels[page] + ". Ekranlar arasında dokunarak gezinin.");
        }
    }
}
